import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { chatWithAssistant } from "@/lib/ai/chat-service"

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = ChatSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const { response, conversationId } = await chatWithAssistant(
      session.user.id,
      result.data.conversationId || null,
      result.data.message
    )

    return NextResponse.json({ response, conversationId })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
