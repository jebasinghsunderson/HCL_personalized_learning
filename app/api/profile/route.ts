import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          interests: true,
          learnerSkills: { include: { skill: true } },
          goals: true,
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
  })
}

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  weeklyHours: z.number().min(1).max(80).optional(),
  preferredLearningStyle: z.enum(["visual", "reading", "hands-on", "mixed"]).optional(),
  preferredDifficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  currentRole: z.string().max(100).optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().min(0).max(5),
  })).optional(),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = UpdateProfileSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten() }, { status: 400 })
  }

  const data = result.data

  if (data.name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name }
    })
  }

  let profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    profile = await prisma.learnerProfile.create({
      data: { userId: session.user.id }
    })
  }

  await prisma.learnerProfile.update({
    where: { id: profile.id },
    data: {
      ...(data.experienceLevel && { experienceLevel: data.experienceLevel }),
      ...(data.weeklyHours && { weeklyHours: data.weeklyHours }),
      ...(data.preferredLearningStyle && { preferredLearningStyle: data.preferredLearningStyle }),
      ...(data.preferredDifficulty && { preferredDifficulty: data.preferredDifficulty }),
      ...(data.currentRole !== undefined && { currentRole: data.currentRole }),
    }
  })

  if (data.interests) {
    await prisma.interest.deleteMany({ where: { profileId: profile.id } })
    for (const name of data.interests) {
      await prisma.interest.create({ data: { profileId: profile.id, name } })
    }
  }

  if (data.skills) {
    for (const s of data.skills) {
      const skill = await prisma.skill.findUnique({ where: { name: s.name } })
      if (skill) {
        await prisma.learnerSkill.upsert({
          where: { profileId_skillId: { profileId: profile.id, skillId: skill.id } },
          create: { profileId: profile.id, skillId: skill.id, proficiency: s.proficiency },
          update: { proficiency: s.proficiency }
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}
