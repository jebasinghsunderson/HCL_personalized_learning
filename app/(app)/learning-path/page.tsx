"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Lock, Play, SkipForward, Clock, BookOpen } from "lucide-react"

interface PathItem {
  id: string
  title: string | null
  description: string | null
  phase: string
  status: string
  order: number
  estimatedHours: number
  isMilestone: boolean
  resource: { title: string; type: string; provider: string | null; difficulty: string } | null
  skill: { name: string } | null
}

interface LearningPath {
  id: string
  title: string
  description: string | null
  status: string
  items: PathItem[]
  goal: { title: string; targetRole: string | null } | null
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  in_progress: <Play className="h-5 w-5 text-blue-600" />,
  not_started: <Circle className="h-5 w-5 text-slate-400" />,
  locked: <Lock className="h-5 w-5 text-slate-300" />,
  skipped: <SkipForward className="h-5 w-5 text-orange-500" />,
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  not_started: "bg-slate-100 text-slate-800",
  locked: "bg-slate-50 text-slate-500",
  skipped: "bg-orange-100 text-orange-800",
}

export default function LearningPathPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/learning-path")
      .then(r => r.json())
      .then(data => {
        setPaths(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateItemStatus(itemId: string, status: string) {
    await fetch(`/api/learning-path/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    const res = await fetch("/api/learning-path")
    const data = await res.json()
    setPaths(Array.isArray(data) ? data : [])
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No Learning Path Yet</h2>
        <p className="text-slate-500 mt-2">Complete onboarding to generate your personalized learning path.</p>
        <Button className="mt-4" onClick={() => window.location.href = "/onboarding"}>
          Start Onboarding
        </Button>
      </div>
    )
  }

  const path = paths[0]
  const completedCount = path.items.filter(i => i.status === "completed").length
  const totalCount = path.items.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const phases = [...new Set(path.items.map(i => i.phase))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{path.title}</h1>
        {path.goal && (
          <p className="text-slate-500 mt-1">Goal: {path.goal.title}</p>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm text-slate-500">{completedCount}/{totalCount} items</span>
          </div>
          <Progress value={progressPercent} />
          <p className="text-xs text-slate-500 mt-1">{progressPercent}% complete</p>
        </CardContent>
      </Card>

      {phases.map(phase => {
        const phaseItems = path.items.filter(i => i.phase === phase)
        const phaseCompleted = phaseItems.filter(i => i.status === "completed").length
        return (
          <div key={phase}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-slate-800 capitalize">{phase}</h2>
              <Badge variant="secondary">{phaseCompleted}/{phaseItems.length}</Badge>
            </div>
            <div className="space-y-2">
              {phaseItems.map((item, idx) => (
                <Card key={item.id} className={item.status === "locked" ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{statusIcons[item.status]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-900">
                            {item.title || item.resource?.title || `Step ${item.order}`}
                          </h3>
                          {item.isMilestone && <Badge variant="default">Milestone</Badge>}
                          {item.resource && (
                            <Badge variant="outline">{item.resource.type}</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {item.skill && <span>Skill: {item.skill.name}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.estimatedHours}h
                          </span>
                          {item.resource?.difficulty && (
                            <span className="capitalize">{item.resource.difficulty}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.status === "not_started" && (
                          <Button size="sm" onClick={() => updateItemStatus(item.id, "in_progress")}>
                            Start
                          </Button>
                        )}
                        {item.status === "in_progress" && (
                          <Button size="sm" onClick={() => updateItemStatus(item.id, "completed")}>
                            Complete
                          </Button>
                        )}
                        {(item.status === "not_started" || item.status === "in_progress") && (
                          <Button size="sm" variant="ghost" onClick={() => updateItemStatus(item.id, "skipped")}>
                            Skip
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
