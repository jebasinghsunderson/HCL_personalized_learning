import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      skill: true,
      questions: {
        select: {
          id: true,
          text: true,
          options: true,
        }
      }
    }
  })

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  return NextResponse.json(assessment)
}
