import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: user.id },
    include: {
      interests: true,
      learnerSkills: { include: { skill: true } },
      goals: true,
    }
  })

  return profile
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
