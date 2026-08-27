import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { updatedAt: "desc" },
    take: 20
  })

  return NextResponse.json(conversations)
}
