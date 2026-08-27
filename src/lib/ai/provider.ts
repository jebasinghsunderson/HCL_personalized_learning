export interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIResponse {
  content: string
}

export interface AIProvider {
  chat(messages: AIMessage[], options?: { maxTokens?: number }): Promise<AIResponse>
}

class AnthropicProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number }): Promise<AIResponse> {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default
      const client = new Anthropic({ apiKey: this.apiKey })

      const systemMessage = messages.find(m => m.role === "system")
      const chatMessages = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }))

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: options?.maxTokens || 2048,
        system: systemMessage?.content || "",
        messages: chatMessages,
      })

      const textBlock = response.content.find(block => block.type === "text")
      return { content: textBlock?.text || "" }
    } catch (error) {
      console.error("Anthropic API error, falling back:", error)
      const { FallbackProvider } = await import("./fallback")
      const fallback = new FallbackProvider()
      return fallback.chat(messages)
    }
  }
}

class OpenAICompatibleProvider implements AIProvider {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.model = model
  }

  async chat(messages: AIMessage[], options?: { maxTokens?: number }): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: options?.maxTokens || 2048,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return { content: data.choices?.[0]?.message?.content || "" }
    } catch (error) {
      console.error(`${this.model} API error, falling back:`, error)
      const { FallbackProvider } = await import("./fallback")
      const fallback = new FallbackProvider()
      return fallback.chat(messages)
    }
  }
}

class FallbackProviderImpl implements AIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const { FallbackProvider } = await import("./fallback")
    const fallback = new FallbackProvider()
    return fallback.chat(messages)
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "fallback"

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(process.env.ANTHROPIC_API_KEY)
  }

  if (provider === "grok" && process.env.XAI_API_KEY) {
    return new OpenAICompatibleProvider(
      process.env.XAI_API_KEY,
      "https://api.x.ai/v1",
      process.env.AI_MODEL || "grok-3-mini"
    )
  }

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    return new OpenAICompatibleProvider(
      process.env.GROQ_API_KEY,
      "https://api.groq.com/openai/v1",
      process.env.AI_MODEL || "qwen/qwen3.6-27b"
    )
  }

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAICompatibleProvider(
      process.env.OPENAI_API_KEY,
      "https://api.openai.com/v1",
      process.env.AI_MODEL || "gpt-4o-mini"
    )
  }

  // Generic OpenAI-compatible endpoint
  if (provider === "custom" && process.env.CUSTOM_AI_API_KEY && process.env.CUSTOM_AI_BASE_URL) {
    return new OpenAICompatibleProvider(
      process.env.CUSTOM_AI_API_KEY,
      process.env.CUSTOM_AI_BASE_URL,
      process.env.AI_MODEL || "default"
    )
  }

  return new FallbackProviderImpl()
}
