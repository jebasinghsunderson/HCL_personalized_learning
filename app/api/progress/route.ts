import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const progress = await prisma.progress.findMany({
    where: { profileId: profile.id },
    include: { resource: { include: { skills: { include: { skill: true } } } } },
    orderBy: { updatedAt: "desc" }
  })

  const learningPaths = await prisma.learningPath.findMany({
    where: { profileId: profile.id },
    include: { items: true }
  })

  const totalItems = learningPaths.reduce((sum, p) => sum + p.items.length, 0)
  const completedItems = learningPaths.reduce(
    (sum, p) => sum + p.items.filter(i => i.status === "completed").length, 0
  )
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const completedResources = progress.filter(p => p.status === "completed")
  const totalHours = progress.reduce((sum, p) => sum + p.timeSpent, 0)

  const skillsFromCompleted = new Set<string>()
  for (const p of completedResources) {
    for (const rs of p.resource.skills) {
      skillsFromCompleted.add(rs.skill.name)
    }
  }

  return NextResponse.json({
    overallProgress,
    totalItems,
    completedItems,
    completedResources: completedResources.length,
    totalHours,
    skillsDeveloped: skillsFromCompleted.size,
    recentActivity: progress.slice(0, 10),
  })
}
