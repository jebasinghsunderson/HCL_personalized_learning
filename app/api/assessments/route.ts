import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const assessments = await prisma.assessment.findMany({
    include: {
      skill: true,
      questions: { select: { id: true } }
    }
  })

  return NextResponse.json(assessments)
}
