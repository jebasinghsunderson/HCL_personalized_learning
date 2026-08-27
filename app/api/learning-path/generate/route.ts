import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateLearningPath } from "@/lib/learning-path/generator"

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
    return NextResponse.json({ error: "No active goal found" }, { status: 404 })
  }

  try {
    const pathId = await generateLearningPath(profile.id, goal.id)
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        items: { orderBy: { order: "asc" }, include: { resource: true, skill: true } },
        goal: true
      }
    })
    return NextResponse.json(path)
  } catch (error) {
    console.error("Learning path generation error:", error)
    return NextResponse.json({ error: "Failed to generate learning path" }, { status: 500 })
  }
}
