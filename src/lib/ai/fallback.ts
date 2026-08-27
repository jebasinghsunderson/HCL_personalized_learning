import { AIMessage, AIProvider, AIResponse } from "./provider"

interface GoalMapping {
  targetRole: string
  requiredSkills: string[]
  suggestedProjects: string[]
}

const GOAL_MAPPINGS: Record<string, GoalMapping> = {
  "machine learning": {
    targetRole: "Machine Learning Engineer",
    requiredSkills: ["Python", "SQL", "Statistics", "NumPy", "Pandas", "Machine Learning", "Deep Learning", "PyTorch", "Docker", "Model Deployment"],
    suggestedProjects: ["End-to-end ML pipeline", "Production ML API", "ML model monitoring dashboard"],
  },
  "data scientist": {
    targetRole: "Data Scientist",
    requiredSkills: ["Python", "SQL", "Statistics", "Probability", "NumPy", "Pandas", "Data Visualization", "Machine Learning", "Jupyter"],
    suggestedProjects: ["Data analysis portfolio", "Predictive modeling project", "A/B testing framework"],
  },
  "web developer": {
    targetRole: "Full-Stack Web Developer",
    requiredSkills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "REST APIs", "Git", "SQL"],
    suggestedProjects: ["Full-stack SaaS application", "E-commerce platform", "Real-time chat application"],
  },
  "frontend": {
    targetRole: "Frontend Developer",
    requiredSkills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST APIs"],
    suggestedProjects: ["Component library", "Interactive dashboard", "Progressive web app"],
  },
  "backend": {
    targetRole: "Backend Developer",
    requiredSkills: ["JavaScript", "TypeScript", "Node.js", "Express", "REST APIs", "SQL", "Docker", "Git", "Linux", "CI/CD"],
    suggestedProjects: ["RESTful API service", "Microservices architecture", "Database optimization project"],
  },
  "cloud": {
    targetRole: "Cloud Engineer",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Git", "Python", "Networking"],
    suggestedProjects: ["Cloud migration project", "Infrastructure as Code setup", "Multi-region deployment"],
  },
  "cybersecurity": {
    targetRole: "Cybersecurity Analyst",
    requiredSkills: ["Linux", "Networking", "Cybersecurity", "Python", "SQL", "Docker", "Git"],
    suggestedProjects: ["Security audit framework", "Vulnerability scanner", "Incident response playbook"],
  },
  "product manager": {
    targetRole: "Product Manager",
    requiredSkills: ["Product Management", "Agile", "UI/UX Design", "SQL", "Data Visualization", "System Design"],
    suggestedProjects: ["Product roadmap creation", "User research study", "Feature prioritization framework"],
  },
}

function findBestGoalMapping(goalText: string): GoalMapping {
  const lower = goalText.toLowerCase()
  for (const [key, mapping] of Object.entries(GOAL_MAPPINGS)) {
    if (lower.includes(key)) return mapping
  }
  return GOAL_MAPPINGS["web developer"]
}

function extractTimeframe(goalText: string): number {
  const match = goalText.match(/(\d+)\s*(month|year|week)/i)
  if (!match) return 6
  const num = parseInt(match[1])
  if (match[2].toLowerCase().startsWith("year")) return num * 12
  if (match[2].toLowerCase().startsWith("week")) return Math.max(1, Math.ceil(num / 4))
  return num
}

export class FallbackProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return { content: "I'm here to help with your learning journey!" }

    const content = lastMessage.content.toLowerCase()
    const systemContext = messages.find(m => m.role === "system")?.content || ""

    if (systemContext.includes("goal analysis") || content.includes("analyze")) {
      return this.handleGoalAnalysis(lastMessage.content)
    }

    if (content.includes("what should i study") || content.includes("what should i learn")) {
      return { content: "Based on your learning path, I'd recommend focusing on the next uncompleted item in your current phase. Consistency is key - try to dedicate your scheduled study time to making progress on your current module. If you're feeling stuck, try breaking the material into smaller chunks or look for supplementary resources like videos or practice exercises." }
    }

    if (content.includes("struggling") || content.includes("difficult") || content.includes("hard")) {
      return { content: "It's completely normal to find some topics challenging! Here are some strategies:\n\n1. Break the material into smaller, manageable sections\n2. Look for alternative explanations (videos, different tutorials)\n3. Practice with hands-on exercises\n4. Review prerequisite material to strengthen your foundation\n5. Consider taking the related assessment to identify specific gaps\n\nRemember, persistence through difficulty is where the deepest learning happens." }
    }

    if (content.includes("skip") || content.includes("can i skip")) {
      return { content: "You can skip a module if you're already confident in the material. I'd recommend taking the related assessment first to verify your knowledge. If you score above 80%, skipping is a good option. Otherwise, even a quick review might help reinforce concepts you'll need later." }
    }

    if (content.includes("progress") || content.includes("how close") || content.includes("how far")) {
      return { content: "You're making great progress on your learning path! Check your dashboard for detailed progress metrics including overall completion percentage, skills developed, and upcoming milestones. Keep up your consistent study schedule and you'll reach your goal within your target timeframe." }
    }

    if (content.includes("recommend") || content.includes("why")) {
      return { content: "Resources are recommended based on several factors: how well they align with your career goal, which skill gaps they address, whether you have the prerequisites, their difficulty relative to your current level, and how they fit your available study time. Each recommendation is scored and ranked to give you the most impactful next steps." }
    }

    if (content.includes("project") || content.includes("build")) {
      return { content: "Projects are excellent for solidifying your learning! I recommend choosing a project that combines multiple skills from your current phase. Start small and iterate - even a simple project that you complete is more valuable than an ambitious one left unfinished. Consider the suggested projects in your learning path as starting points." }
    }

    return { content: "I'm your AI learning assistant! I can help you with:\n\n- Understanding why resources are recommended\n- Deciding what to study next\n- Tips when you're struggling with material\n- Advice on whether to skip content\n- Project suggestions\n- Tracking your progress toward your goal\n\nWhat would you like to know?" }
  }

  handleGoalAnalysis(goalText: string): AIResponse {
    const mapping = findBestGoalMapping(goalText)
    const timeframe = extractTimeframe(goalText)

    const result = {
      targetRole: mapping.targetRole,
      timeframeMonths: timeframe,
      requiredSkills: mapping.requiredSkills,
      suggestedProjects: mapping.suggestedProjects,
    }

    return { content: JSON.stringify(result) }
  }
}
