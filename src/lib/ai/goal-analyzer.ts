import { z } from "zod"
import { getAIProvider } from "./provider"

export const GoalAnalysisSchema = z.object({
  targetRole: z.string(),
  timeframeMonths: z.number(),
  requiredSkills: z.array(z.string()),
  suggestedProjects: z.array(z.string()),
})

export type GoalAnalysis = z.infer<typeof GoalAnalysisSchema>

export async function analyzeGoal(goalText: string, existingSkills: string[] = []): Promise<GoalAnalysis> {
  const provider = getAIProvider()

  const prompt = `Analyze this learning goal and return a JSON object with the following structure:
{
  "targetRole": "the target job role",
  "timeframeMonths": number (months to achieve, default 6 if not specified),
  "requiredSkills": ["list of skills needed"],
  "suggestedProjects": ["list of 2-3 portfolio projects"]
}

The learner already has these skills: ${existingSkills.join(", ") || "none specified"}

Goal: "${goalText}"

Return ONLY the JSON object, no other text.`

  try {
    const response = await provider.chat([
      { role: "system", content: "You are a career advisor AI. Analyze learning goals and return structured JSON. goal analysis" },
      { role: "user", content: prompt }
    ])

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const parsed = JSON.parse(jsonMatch[0])
    return GoalAnalysisSchema.parse(parsed)
  } catch (error) {
    console.error("Goal analysis error:", error)
    const { FallbackProvider } = await import("./fallback")
    const fallback = new FallbackProvider()
    const fallbackResponse = fallback.handleGoalAnalysis(goalText)
    const parsed = JSON.parse(fallbackResponse.content)
    return GoalAnalysisSchema.parse(parsed)
  }
}
