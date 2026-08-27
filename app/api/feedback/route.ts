import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const FeedbackSchema = z.object({
  resourceId: z.string(),
  type: z.enum(["helpful", "not_helpful", "too_easy", "too_difficult", "already_know", "not_relevant", "more_practical"]),
  comment: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = FeedbackSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const feedback = await prisma.feedback.create({
    data: {
      profileId: profile.id,
      resourceId: result.data.resourceId,
      type: result.data.type,
      comment: result.data.comment,
    }
  })

  return NextResponse.json(feedback)
}

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

  const feedback = await prisma.feedback.findMany({
    where: { profileId: profile.id },
    include: { resource: true },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(feedback)
}
