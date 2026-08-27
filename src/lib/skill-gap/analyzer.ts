import { prisma } from "@/lib/db"

export interface SkillGap {
  skillName: string
  skillId: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: "critical" | "high" | "medium" | "low"
}

function calculatePriority(gap: number, isCoreskill: boolean): "critical" | "high" | "medium" | "low" {
  if (gap >= 4 && isCoreskill) return "critical"
  if (gap >= 3) return "high"
  if (gap >= 2) return "medium"
  return "low"
}

function getRequiredLevel(skillName: string, targetRole: string): number {
  const coreSkills: Record<string, string[]> = {
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Docker"],
    "Data Scientist": ["Python", "Statistics", "Machine Learning", "SQL", "Pandas"],
    "Full-Stack Web Developer": ["JavaScript", "TypeScript", "React", "Node.js", "SQL"],
    "Frontend Developer": ["JavaScript", "TypeScript", "React", "CSS", "HTML"],
    "Backend Developer": ["Node.js", "TypeScript", "SQL", "Docker", "REST APIs"],
    "Cloud Engineer": ["Docker", "Kubernetes", "AWS", "Terraform", "Linux"],
  }

  const roleCore = coreSkills[targetRole] || []
  if (roleCore.includes(skillName)) return 4
  return 3
}

export async function analyzeSkillGaps(
  profileId: string,
  requiredSkills: string[]
): Promise<SkillGap[]> {
  const profile = await prisma.learnerProfile.findUnique({
    where: { id: profileId },
    include: {
      learnerSkills: { include: { skill: true } },
      goals: { where: { status: "active" }, take: 1 }
    }
  })

  if (!profile) return []

  const targetRole = profile.goals[0]?.targetRole || ""
  const currentSkillMap = new Map(
    profile.learnerSkills.map(ls => [ls.skill.name, ls.proficiency])
  )

  const allSkills = await prisma.skill.findMany({
    where: { name: { in: requiredSkills } }
  })

  const gaps: SkillGap[] = allSkills.map(skill => {
    const currentLevel = currentSkillMap.get(skill.name) || 0
    const requiredLevel = getRequiredLevel(skill.name, targetRole)
    const gap = Math.max(0, requiredLevel - currentLevel)
    const isCore = requiredLevel >= 4

    return {
      skillName: skill.name,
      skillId: skill.id,
      currentLevel,
      requiredLevel,
      gap,
      priority: calculatePriority(gap, isCore)
    }
  }).filter(g => g.gap > 0)

  gaps.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.gap - a.gap
  })

  return gaps
}
