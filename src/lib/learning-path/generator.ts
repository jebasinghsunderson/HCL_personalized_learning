import { prisma } from "@/lib/db"
import { analyzeSkillGaps } from "@/lib/skill-gap/analyzer"

interface PhaseConfig {
  name: string
  order: number
  skillTypes: string[]
}

const PHASES: PhaseConfig[] = [
  { name: "foundations", order: 1, skillTypes: ["beginner"] },
  { name: "core", order: 2, skillTypes: ["intermediate"] },
  { name: "specialization", order: 3, skillTypes: ["advanced"] },
  { name: "projects", order: 4, skillTypes: ["project"] },
  { name: "capstone", order: 5, skillTypes: ["capstone"] },
]

function topologicalSort(
  skills: string[],
  prereqMap: Map<string, string[]>
): string[] {
  const visited = new Set<string>()
  const result: string[] = []

  function visit(skill: string) {
    if (visited.has(skill)) return
    visited.add(skill)
    const prereqs = prereqMap.get(skill) || []
    for (const prereq of prereqs) {
      if (skills.includes(prereq)) {
        visit(prereq)
      }
    }
    result.push(skill)
  }

  for (const skill of skills) {
    visit(skill)
  }

  return result
}

export async function generateLearningPath(
  profileId: string,
  goalId: string
): Promise<string> {
  const profile = await prisma.learnerProfile.findUnique({
    where: { id: profileId },
    include: {
      learnerSkills: { include: { skill: true } },
      goals: { where: { id: goalId } },
    }
  })

  if (!profile || !profile.goals[0]) {
    throw new Error("Profile or goal not found")
  }

  const goal = profile.goals[0]
  const requiredSkills = goal.requiredSkills
  const currentSkillMap = new Map(
    profile.learnerSkills.map(ls => [ls.skill.name, ls.proficiency])
  )

  const gaps = await analyzeSkillGaps(profileId, requiredSkills)

  const prerequisites = await prisma.prerequisite.findMany({
    include: { skill: true, prerequisite: true }
  })
  const prereqMap = new Map<string, string[]>()
  for (const p of prerequisites) {
    const existing = prereqMap.get(p.skill.name) || []
    existing.push(p.prerequisite.name)
    prereqMap.set(p.skill.name, existing)
  }

  const skillsNeeded = gaps.map(g => g.skillName)
  const sortedSkills = topologicalSort(skillsNeeded, prereqMap)

  const resources = await prisma.resource.findMany({
    include: { skills: { include: { skill: true } } }
  })

  const resourcesBySkill = new Map<string, typeof resources>()
  for (const resource of resources) {
    for (const rs of resource.skills) {
      const existing = resourcesBySkill.get(rs.skill.name) || []
      existing.push(resource)
      resourcesBySkill.set(rs.skill.name, existing)
    }
  }

  const learningPath = await prisma.learningPath.create({
    data: {
      profileId,
      goalId,
      title: `Path to ${goal.targetRole || goal.title}`,
      description: `Personalized learning path for: ${goal.title}`,
      status: "active"
    }
  })

  let order = 0
  const usedResources = new Set<string>()
  const itemsData: Array<{
    learningPathId: string
    resourceId: string | null
    skillId: string | null
    order: number
    phase: string
    status: string
    estimatedHours: number
    isMilestone: boolean
    title: string
    description: string | null
  }> = []

  for (const skillName of sortedSkills) {
    const gap = gaps.find(g => g.skillName === skillName)
    if (!gap) continue

    const skillResources = resourcesBySkill.get(skillName) || []
    const currentLevel = currentSkillMap.get(skillName) || 0

    let phase: string
    if (currentLevel === 0) phase = "foundations"
    else if (currentLevel < 2) phase = "core"
    else phase = "specialization"

    const suitableResources = skillResources
      .filter(r => !usedResources.has(r.id))
      .sort((a, b) => {
        const diffMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
        return (diffMap[a.difficulty] || 2) - (diffMap[b.difficulty] || 2)
      })

    const resourceToUse = suitableResources.find(r => {
      const diffMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
      const rLevel = diffMap[r.difficulty] || 2
      return rLevel >= currentLevel && rLevel <= currentLevel + 2
    }) || suitableResources[0]

    if (resourceToUse) {
      usedResources.add(resourceToUse.id)
      order++

      const prereqs = prereqMap.get(skillName) || []
      const hasPrereqs = prereqs.every(p => (currentSkillMap.get(p) || 0) >= 2)
      const status = order === 1 || hasPrereqs ? "not_started" : "locked"

      itemsData.push({
        learningPathId: learningPath.id,
        resourceId: resourceToUse.id,
        skillId: gap.skillId,
        order,
        phase,
        status,
        estimatedHours: resourceToUse.estimatedHours,
        isMilestone: false,
        title: resourceToUse.title,
        description: resourceToUse.description,
      })
    }
  }

  const projectResources = resources.filter(r =>
    r.type === "project" && !usedResources.has(r.id)
  )
  if (projectResources.length > 0) {
    const project = projectResources[0]
    order++
    itemsData.push({
      learningPathId: learningPath.id,
      resourceId: project.id,
      skillId: null,
      order,
      phase: "projects",
      status: "locked",
      estimatedHours: project.estimatedHours,
      isMilestone: true,
      title: project.title,
      description: project.description,
    })
  }

  order++
  itemsData.push({
    learningPathId: learningPath.id,
    resourceId: null,
    skillId: null,
    order,
    phase: "capstone",
    status: "locked",
    estimatedHours: 20,
    isMilestone: true,
    title: `${goal.targetRole || "Goal"} Capstone Project`,
    description: `Complete a comprehensive project demonstrating mastery of ${goal.targetRole || "your goal"} skills.`,
  })

  for (const item of itemsData) {
    await prisma.learningPathItem.create({ data: item })
  }

  return learningPath.id
}
