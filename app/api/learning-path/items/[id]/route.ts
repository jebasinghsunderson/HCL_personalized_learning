import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const UpdateItemSchema = z.object({
  status: z.enum(["locked", "not_started", "in_progress", "completed", "skipped"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const result = UpdateItemSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const item = await prisma.learningPathItem.findUnique({
    where: { id },
    include: { learningPath: true }
  })

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile || item.learningPath.profileId !== profile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const updated = await prisma.learningPathItem.update({
    where: { id },
    data: { status: result.data.status }
  })

  if (result.data.status === "completed") {
    const nextItem = await prisma.learningPathItem.findFirst({
      where: {
        learningPathId: item.learningPathId,
        order: item.order + 1,
        status: "locked"
      }
    })
    if (nextItem) {
      await prisma.learningPathItem.update({
        where: { id: nextItem.id },
        data: { status: "not_started" }
      })
    }

    if (item.resourceId) {
      await prisma.progress.upsert({
        where: {
          profileId_resourceId: { profileId: profile.id, resourceId: item.resourceId }
        },
        create: {
          profileId: profile.id,
          resourceId: item.resourceId,
          status: "completed",
          completedAt: new Date()
        },
        update: {
          status: "completed",
          completedAt: new Date()
        }
      })
    }

    if (item.skillId) {
      const currentSkill = await prisma.learnerSkill.findUnique({
        where: { profileId_skillId: { profileId: profile.id, skillId: item.skillId } }
      })
      const newProficiency = Math.min(5, (currentSkill?.proficiency || 0) + 1)
      await prisma.learnerSkill.upsert({
        where: { profileId_skillId: { profileId: profile.id, skillId: item.skillId } },
        create: { profileId: profile.id, skillId: item.skillId, proficiency: newProficiency },
        update: { proficiency: newProficiency }
      })
    }
  }

  return NextResponse.json(updated)
}
