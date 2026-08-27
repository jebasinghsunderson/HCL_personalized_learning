import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { analyzeSkillGaps } from "@/lib/skill-gap/analyzer"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id },
    include: { goals: { where: { status: "active" }, take: 1 } }
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const goal = profile.goals[0]
  if (!goal) {
    return NextResponse.json({ error: "No active goal" }, { status: 404 })
  }

  const gaps = await analyzeSkillGaps(profile.id, goal.requiredSkills)
  return NextResponse.json({ gaps, goalTitle: goal.title, targetRole: goal.targetRole })
}
