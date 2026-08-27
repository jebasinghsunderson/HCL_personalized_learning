"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Target, TrendingUp } from "lucide-react"

interface SkillData {
  id: string
  name: string
  proficiency: number
  skill: { name: string; category: string }
}

interface SkillGap {
  skillName: string
  skillId: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: string
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillData[]>([])
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then(r => r.json()),
      fetch("/api/skill-gap/analyze", { method: "POST" }).then(r => r.json()).catch(() => ({ gaps: [] }))
    ]).then(([profile, gapData]) => {
      setSkills(profile.profile?.learnerSkills || [])
      setGaps(gapData.gaps || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const priorityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Skills</h1>
        <p className="text-slate-500 mt-1">Track your skill development and identify gaps</p>
      </div>

      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{s.skill.name}</span>
                      <Badge variant="outline" className="text-xs">{s.skill.category}</Badge>
                    </div>
                    <span className="text-sm text-slate-500">{s.proficiency}/5</span>
                  </div>
                  <Progress value={s.proficiency * 20} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gaps.map(g => (
                <div key={g.skillId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{g.skillName}</span>
                    <Badge className={priorityColors[g.priority]}>{g.priority}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current Level</p>
                      <Progress value={g.currentLevel * 20} />
                      <p className="text-xs text-slate-500 mt-1">{g.currentLevel}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Required Level</p>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${g.requiredLevel * 20}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{g.requiredLevel}/5</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Gap: {g.gap} levels to close</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {skills.length === 0 && gaps.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Skills Tracked Yet</h2>
          <p className="text-slate-500 mt-2">Complete onboarding to set up your skill profile.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/onboarding"}>
            Start Onboarding
          </Button>
        </div>
      )}
    </div>
  )
}
