import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const SubmitSchema = z.object({
  answers: z.array(z.number()),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const result = SubmitSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: true, skill: true }
  })

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const { answers } = result.data
  let correct = 0
  const questionResults = assessment.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex
    if (isCorrect) correct++
    return {
      questionId: q.id,
      selectedAnswer: answers[i],
      correctAnswer: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    }
  })

  const score = assessment.questions.length > 0
    ? Math.round((correct / assessment.questions.length) * 100)
    : 0
  const passed = score >= 70

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      profileId: profile.id,
      assessmentId: id,
      score,
      passed,
      answers,
    }
  })

  if (passed) {
    const proficiencyGain = score >= 90 ? 2 : 1
    const currentSkill = await prisma.learnerSkill.findUnique({
      where: { profileId_skillId: { profileId: profile.id, skillId: assessment.skillId } }
    })
    const newProficiency = Math.min(5, (currentSkill?.proficiency || 0) + proficiencyGain)

    await prisma.learnerSkill.upsert({
      where: { profileId_skillId: { profileId: profile.id, skillId: assessment.skillId } },
      create: { profileId: profile.id, skillId: assessment.skillId, proficiency: newProficiency },
      update: { proficiency: newProficiency }
    })
  }

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    passed,
    correct,
    total: assessment.questions.length,
    questionResults,
    skillName: assessment.skill.name,
  })
}
