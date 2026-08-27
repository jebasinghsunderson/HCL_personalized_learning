import { prisma } from "@/lib/db"

export interface ScoredResource {
  resourceId: string
  title: string
  description: string | null
  type: string
  provider: string | null
  difficulty: string
  estimatedHours: number
  score: number
  reasons: string[]
  skills: string[]
}

export async function getRecommendations(profileId: string, limit = 10): Promise<ScoredResource[]> {
  const profile = await prisma.learnerProfile.findUnique({
    where: { id: profileId },
    include: {
      learnerSkills: { include: { skill: true } },
      goals: { where: { status: "active" }, take: 1 },
      progress: true,
      feedback: true,
    }
  })

  if (!profile) return []

  const completedResourceIds = new Set(
    profile.progress.filter(p => p.status === "completed").map(p => p.resourceId)
  )

  const negativeFeedbackResources = new Set(
    profile.feedback
      .filter(f => ["not_helpful", "not_relevant", "already_know"].includes(f.type))
      .map(f => f.resourceId)
  )

  const positiveFeedbackResources = new Set(
    profile.feedback
      .filter(f => ["helpful"].includes(f.type))
      .map(f => f.resourceId)
  )

  const goal = profile.goals[0]
  const requiredSkills = new Set(goal?.requiredSkills || [])
  const currentSkillMap = new Map(
    profile.learnerSkills.map(ls => [ls.skill.name, ls.proficiency])
  )

  const resources = await prisma.resource.findMany({
    include: { skills: { include: { skill: true } } }
  })

  const prerequisites = await prisma.prerequisite.findMany({
    include: { skill: true, prerequisite: true }
  })
  const prereqMap = new Map<string, string[]>()
  for (const p of prerequisites) {
    const existing = prereqMap.get(p.skill.name) || []
    existing.push(p.prerequisite.name)
    prereqMap.set(p.skill.name, existing)
  }

  const scored: ScoredResource[] = []

  for (const resource of resources) {
    if (completedResourceIds.has(resource.id)) continue

    const resourceSkills = resource.skills.map(rs => rs.skill.name)
    const reasons: string[] = []

    // Goal relevance (0-1)
    const goalRelevantSkills = resourceSkills.filter(s => requiredSkills.has(s))
    const goalRelevance = requiredSkills.size > 0
      ? goalRelevantSkills.length / Math.min(resourceSkills.length || 1, requiredSkills.size)
      : 0.3
    if (goalRelevantSkills.length > 0) {
      reasons.push(`Addresses goal-required skills: ${goalRelevantSkills.join(", ")}`)
    }

    // Skill gap relevance (0-1)
    let skillGapRelevance = 0
    const gapSkills: string[] = []
    for (const skillName of resourceSkills) {
      const current = currentSkillMap.get(skillName) || 0
      if (current < 3) {
        skillGapRelevance += (3 - current) / 3
        gapSkills.push(skillName)
      }
    }
    skillGapRelevance = Math.min(1, skillGapRelevance / Math.max(resourceSkills.length, 1))
    if (gapSkills.length > 0) {
      reasons.push(`Fills skill gaps in: ${gapSkills.join(", ")}`)
    }

    // Prerequisite match (0-1)
    let prerequisiteMatch = 1
    for (const skillName of resourceSkills) {
      const prereqs = prereqMap.get(skillName) || []
      for (const prereq of prereqs) {
        const level = currentSkillMap.get(prereq) || 0
        if (level < 2) {
          prerequisiteMatch -= 0.3
        }
      }
    }
    prerequisiteMatch = Math.max(0, prerequisiteMatch)
    if (prerequisiteMatch < 0.7) {
      reasons.push("Some prerequisites not yet met")
    }

    // Difficulty match (0-1)
    const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
    const expMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 3 }
    const resourceLevel = levelMap[resource.difficulty] || 2
    const learnerLevel = expMap[profile.experienceLevel] || 2
    const difficultyMatch = 1 - Math.abs(resourceLevel - learnerLevel) * 0.3
    if (Math.abs(resourceLevel - learnerLevel) <= 1) {
      reasons.push(`Difficulty matches your ${profile.experienceLevel} level`)
    }

    // Preference match (0-1)
    let preferenceMatch = 0.5
    if (profile.preferredLearningStyle === "visual" && ["video", "tutorial"].includes(resource.type)) {
      preferenceMatch = 1
      reasons.push("Matches your visual learning preference")
    } else if (profile.preferredLearningStyle === "hands-on" && ["project", "tutorial"].includes(resource.type)) {
      preferenceMatch = 1
      reasons.push("Matches your hands-on learning preference")
    } else if (profile.preferredLearningStyle === "reading" && ["book", "article", "course"].includes(resource.type)) {
      preferenceMatch = 1
    }

    // Time fit (0-1)
    const weeklyHours = profile.weeklyHours || 5
    const timeFit = resource.estimatedHours <= weeklyHours * 2 ? 1 : Math.max(0, 1 - (resource.estimatedHours - weeklyHours * 2) / 20)

    // Feedback adjustment (-0.5 to 0.5)
    let feedbackAdjustment = 0
    if (negativeFeedbackResources.has(resource.id)) feedbackAdjustment = -0.5
    if (positiveFeedbackResources.has(resource.id)) feedbackAdjustment = 0.5

    const score =
      goalRelevance * 0.25 +
      skillGapRelevance * 0.25 +
      prerequisiteMatch * 0.15 +
      difficultyMatch * 0.10 +
      preferenceMatch * 0.10 +
      timeFit * 0.05 +
      feedbackAdjustment * 0.10

    if (score > 0.1) {
      scored.push({
        resourceId: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        provider: resource.provider,
        difficulty: resource.difficulty,
        estimatedHours: resource.estimatedHours,
        score,
        reasons,
        skills: resourceSkills,
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
