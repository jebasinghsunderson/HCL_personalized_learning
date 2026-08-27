"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  Brain,
  Clock,
  Flame,
  MessageSquare,
  BookOpen,
  Target,
  Trophy,
  ExternalLink,
  Route,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ProfileData {
  id: string
  name: string
  profile: {
    goals: Array<{ id: string; title: string; status: string }>
  } | null
}

interface ProgressData {
  overallProgress: number
  skillsDeveloped: number
  totalHours: number
  completedItems: number
  totalItems: number
}

interface LearningPath {
  id: string
  title: string
  goal: { title: string } | null
  items: Array<{
    id: string
    title: string
    status: string
    phase: number
    order: number
    resource: { title: string; type: string } | null
    skill: { name: string } | null
  }>
}

interface Recommendation {
  resourceId: string
  title: string
  type: string
  reasons: string[]
  skills: string[]
  score: number
  id?: string
  reason?: string
  url?: string
  skill?: string
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1" />
      </CardContent>
    </Card>
  )
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-slate-200 rounded animate-pulse ${className}`} />
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, progressRes, pathsRes, recsRes] = await Promise.allSettled([
          fetch("/api/profile"),
          fetch("/api/progress"),
          fetch("/api/learning-path"),
          fetch("/api/recommendations"),
        ])

        if (profileRes.status === "fulfilled" && profileRes.value.ok) {
          setProfile(await profileRes.value.json())
        }
        if (progressRes.status === "fulfilled" && progressRes.value.ok) {
          setProgress(await progressRes.value.json())
        }
        if (pathsRes.status === "fulfilled" && pathsRes.value.ok) {
          setLearningPaths(await pathsRes.value.json())
        }
        if (recsRes.status === "fulfilled" && recsRes.value.ok) {
          setRecommendations(await recsRes.value.json())
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const currentGoal = profile?.profile?.goals?.find((g) => g.status === "active")
  const currentPath = learningPaths[0]

  // Calculate streak (placeholder logic - in production this would come from the API)
  const streak = 7

  // Calculate hours this week (placeholder)
  const hoursThisWeek = progress ? Math.min(progress.totalHours, 40) : 0

  // Group learning path items by phase
  const phases = currentPath
    ? currentPath.items.reduce(
        (acc, item) => {
          const phase = item.phase || 1
          if (!acc[phase]) acc[phase] = []
          acc[phase].push(item)
          return acc
        },
        {} as Record<number, typeof currentPath.items>
      )
    : {}

  // Skill gap data (derived from learning path skills)
  const skillGapData = currentPath
    ? Array.from(
        new Set(currentPath.items.filter((i) => i.skill).map((i) => i.skill!.name))
      )
        .slice(0, 6)
        .map((name) => {
          const items = currentPath.items.filter((i) => i.skill?.name === name)
          const completed = items.filter((i) => i.status === "completed").length
          const total = items.length
          return {
            name,
            current: Math.round((completed / total) * 5),
            target: 5,
          }
        })
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <SkeletonBlock className="h-8 w-48 mb-2" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
          <SkeletonBlock className="h-10 w-32" />
        </div>

        {/* KPI skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {profile?.name || "Learner"}
          </h1>
          {currentGoal && (
            <p className="text-slate-500 mt-1">
              Current goal: <span className="font-medium text-slate-700">{currentGoal.title}</span>
            </p>
          )}
        </div>
        <Link href="/assistant">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Overall Progress</CardDescription>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress?.overallProgress ?? 0}%</div>
            <Progress value={progress?.overallProgress ?? 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Skills Developed</CardDescription>
            <Brain className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress?.skillsDeveloped ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {progress?.completedItems ?? 0} of {progress?.totalItems ?? 0} items completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Hours This Week</CardDescription>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{hoursThisWeek}</div>
            <p className="text-xs text-slate-500 mt-1">
              {progress?.totalHours ?? 0} hours total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Current Streak</CardDescription>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak} days</div>
            <p className="text-xs text-slate-500 mt-1">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Learning Path */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="h-5 w-5" />
              Current Learning Path
            </CardTitle>
            {currentPath && (
              <CardDescription>{currentPath.title}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {currentPath ? (
              <div className="space-y-4">
                {Object.entries(phases).map(([phase, items]) => {
                  const completed = items.filter((i) => i.status === "completed").length
                  const phaseProgress = Math.round((completed / items.length) * 100)
                  return (
                    <div key={phase} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Phase {phase}
                        </span>
                        <span className="text-xs text-slate-500">
                          {completed}/{items.length} complete
                        </span>
                      </div>
                      <Progress value={phaseProgress} />
                      <div className="flex flex-wrap gap-1">
                        {items.slice(0, 3).map((item) => (
                          <Badge
                            key={item.id}
                            variant={item.status === "completed" ? "success" : "secondary"}
                          >
                            {item.title || item.resource?.title || "Item"}
                          </Badge>
                        ))}
                        {items.length > 3 && (
                          <Badge variant="outline">+{items.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No active learning path yet.</p>
                <Link href="/onboarding">
                  <Button variant="outline" size="sm" className="mt-3">
                    Set up your path
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          {currentPath && (
            <CardFooter>
              <Link href="/learning-path" className="text-sm text-slate-600 hover:text-slate-900">
                View full path →
              </Link>
            </CardFooter>
          )}
        </Card>

        {/* Skill Gap Visualization */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>Current level vs target level</CardDescription>
          </CardHeader>
          <CardContent>
            {skillGapData.length > 0 ? (
              <div className="space-y-4">
                {skillGapData.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{skill.name}</span>
                      <span className="text-slate-500">
                        {skill.current}/{skill.target}
                      </span>
                    </div>
                    <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                      {/* Target level (background) */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-slate-200"
                        style={{ width: `${(skill.target / 5) * 100}%` }}
                      />
                      {/* Current level (foreground) */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(skill.current / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    Current
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-200" />
                    Target
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Brain className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Complete your profile to see skill gaps.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Next
          </CardTitle>
          <CardDescription>Personalized resources based on your goals and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div
                  key={rec.resourceId || index}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {rec.type}
                    </Badge>
                    {rec.url && (
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 mb-1 line-clamp-2">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{rec.reasons?.[0] || rec.reason}</p>
                  {(rec.skills?.[0] || rec.skill) && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {rec.skills?.[0] || rec.skill}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p className="text-sm">
                Recommendations will appear once you have an active learning path.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Milestone */}
      {currentPath && (
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Upcoming Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const nextIncomplete = currentPath.items.find(
                (i) => i.status !== "completed"
              )
              if (!nextIncomplete) {
                return (
                  <p className="text-slate-500">
                    Congratulations! You have completed all items in your current path.
                  </p>
                )
              }
              const completedCount = currentPath.items.filter(
                (i) => i.status === "completed"
              ).length
              const nextMilestone = Math.ceil((completedCount + 1) / 5) * 5
              return (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Complete {nextMilestone} items
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {nextMilestone - completedCount} more to go - Next up:{" "}
                      {nextIncomplete.title || nextIncomplete.resource?.title || "Next item"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">
                      {completedCount}/{nextMilestone}
                    </span>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

