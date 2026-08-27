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

  const paths = await prisma.learningPath.findMany({
    where: { profileId: profile.id },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { resource: true, skill: true }
      },
      goal: true
    },
    orderBy: { updatedAt: "desc" }
  })

  return NextResponse.json(paths)
}
