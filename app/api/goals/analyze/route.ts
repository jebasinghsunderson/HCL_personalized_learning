import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { analyzeGoal } from "@/lib/ai/goal-analyzer"

const AnalyzeGoalSchema = z.object({
  goalText: z.string().min(5).max(500),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = AnalyzeGoalSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id },
    include: { learnerSkills: { include: { skill: true } } }
  })

  const existingSkills = profile?.learnerSkills.map(ls => ls.skill.name) || []
  const analysis = await analyzeGoal(result.data.goalText, existingSkills)

  if (profile) {
    await prisma.goal.create({
      data: {
        profileId: profile.id,
        title: result.data.goalText,
        targetRole: analysis.targetRole,
        timeframeMonths: analysis.timeframeMonths,
        requiredSkills: analysis.requiredSkills,
        status: "active"
      }
    })
  }

  return NextResponse.json(analysis)
}
