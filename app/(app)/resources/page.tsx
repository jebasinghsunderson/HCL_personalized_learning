"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Star, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react"

interface Recommendation {
  resourceId: string
  title: string
  description: string | null
  type: string
  provider: string | null
  difficulty: string
  estimatedHours: number
  score: number
  reasons: string[]
  skills: string[]
}

export default function ResourcesPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(data => {
        setRecommendations(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function giveFeedback(resourceId: string, type: string) {
    await fetch("/api/recommendations/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, type })
    })
    setFeedbackGiven(prev => new Set([...prev, resourceId]))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        {[1,2,3,4].map(i => (
          <div key={i} className="h-40 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recommended Resources</h1>
        <p className="text-slate-500 mt-1">Personalized recommendations based on your goals and skill gaps</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Recommendations Yet</h2>
          <p className="text-slate-500 mt-2">Complete your profile and set a goal to get personalized recommendations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <Card key={rec.resourceId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    #{idx + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{rec.type}</Badge>
                    <Badge variant="secondary" className="capitalize">{rec.difficulty}</Badge>
                    {rec.provider && <Badge variant="outline">{rec.provider}</Badge>}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" /> {rec.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="h-3 w-3" /> Score: {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {rec.skills.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>

                  {rec.reasons.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-800 mb-1">Why recommended:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {rec.reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {!feedbackGiven.has(rec.resourceId) ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => giveFeedback(rec.resourceId, "helpful")}>
                          <ThumbsUp className="h-3 w-3 mr-1" /> Helpful
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => giveFeedback(rec.resourceId, "not_relevant")}>
                          <ThumbsDown className="h-3 w-3 mr-1" /> Not Relevant
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => giveFeedback(rec.resourceId, "already_know")}>
                          Already Know
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => giveFeedback(rec.resourceId, "too_easy")}>
                          Too Easy
                        </Button>
                      </>
                    ) : (
                      <p className="text-xs text-green-600">Thanks for your feedback!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
