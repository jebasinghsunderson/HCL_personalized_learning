import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  Target,
  BarChart3,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Goal Understanding",
    description:
      "Our AI analyzes your learning goals to understand exactly what you want to achieve and creates a clear path forward.",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Identify exactly where you stand and what skills you need to develop through intelligent assessment.",
  },
  {
    icon: BookOpen,
    title: "Personalized Roadmaps",
    description:
      "Get a custom-tailored learning roadmap built specifically for your goals, timeline, and learning style.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Recommendations",
    description:
      "Receive resource recommendations that adapt in real-time based on your progress and preferences.",
  },
  {
    icon: MessageSquare,
    title: "AI Learning Assistant",
    description:
      "Chat with your personal AI tutor anytime to get explanations, clarifications, and guidance.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed analytics and milestones to stay motivated.",
  },
]

const steps = [
  { number: "01", title: "Tell us your goal", description: "Share what you want to learn or achieve" },
  { number: "02", title: "Analyze your skills", description: "We assess your current knowledge level" },
  { number: "03", title: "Identify skill gaps", description: "AI pinpoints exactly what you need to learn" },
  { number: "04", title: "Build your roadmap", description: "Get a personalized step-by-step learning plan" },
  { number: "05", title: "Learn and adapt", description: "Your path evolves as you progress" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">LearnPath AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Powered by Advanced AI
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your AI-Powered{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Learning Path
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              Stop guessing what to learn next. Our AI analyzes your goals, identifies skill gaps, and
              builds a personalized roadmap that adapts as you grow. Learn smarter, not harder.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-indigo-600 px-8 hover:bg-indigo-700">
                  Build My Learning Path
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="px-8">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to learn effectively
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Our platform combines cutting-edge AI with proven learning science to accelerate your growth.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From goal to mastery in five simple steps
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-6 hidden h-5 w-5 text-slate-300 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create Your Personalized Path
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
            Join thousands of learners who have accelerated their growth with AI-powered personalized
            learning roadmaps.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-white px-8 text-indigo-600 hover:bg-indigo-50"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-100">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Personalized in minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> AI-powered insights
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold text-slate-900">LearnPath AI</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} LearnPath AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-slate-600 hover:text-slate-900">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
