"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, CheckCircle2, XCircle, ArrowRight } from "lucide-react"

interface Assessment {
  id: string
  title: string
  description: string | null
  difficulty: string
  skill: { name: string }
  questions: { id: string }[]
}

interface QuestionResult {
  questionId: string
  selectedAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string | null
}

interface AssessmentResult {
  score: number
  passed: boolean
  correct: number
  total: number
  questionResults: QuestionResult[]
  skillName: string
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/assessments")
      .then(r => r.json())
      .then(data => {
        setAssessments(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function startAssessment(assessment: Assessment) {
    setActiveAssessment(assessment)
    setCurrentQuestion(0)
    setAnswers(new Array(assessment.questions.length).fill(-1))
    setResult(null)
    fetch(`/api/assessments/${assessment.id}`)
      .then(r => r.json())
      .then(data => setQuestions(data.questions || []))
  }

  function selectAnswer(index: number) {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = index
    setAnswers(newAnswers)
  }

  async function submitAssessment() {
    if (!activeAssessment) return
    const res = await fetch(`/api/assessments/${activeAssessment.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    })
    const data = await res.json()
    setResult(data)
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            {result.passed ? (
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-2" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
            )}
            <CardTitle className={result.passed ? "text-green-700" : "text-red-700"}>
              {result.passed ? "Passed!" : "Not Passed"}
            </CardTitle>
            <CardDescription>
              Score: {result.score}% ({result.correct}/{result.total} correct)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.questionResults.map((qr, i) => (
                <div key={i} className={`p-3 rounded-lg border ${qr.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-2">
                    {qr.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Question {i + 1}</span>
                  </div>
                  {qr.explanation && (
                    <p className="text-xs text-slate-600 mt-1">{qr.explanation}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => { setActiveAssessment(null); setResult(null) }}>
                Back to Assessments
              </Button>
              {!result.passed && (
                <Button variant="outline" onClick={() => startAssessment(activeAssessment!)}>
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeAssessment && questions.length > 0) {
    const question = questions[currentQuestion]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{activeAssessment.title}</h1>
          <Badge variant="secondary">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-slate-900 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">{question.text}</h2>
            <div className="space-y-3">
              {question.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    answers[currentQuestion] === idx
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm">{option}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === -1}
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={submitAssessment}
              disabled={answers.some(a => a === -1)}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
        <p className="text-slate-500 mt-1">Test your knowledge and track your growth</p>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Assessments Available</h2>
          <p className="text-slate-500 mt-2">Assessments will appear as you progress in your learning path.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map(assessment => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">{assessment.skill.name}</Badge>
                    <Badge variant="secondary">{assessment.difficulty}</Badge>
                    <Badge variant="secondary">{assessment.questions.length} questions</Badge>
                  </div>
                  <Button size="sm" onClick={() => startAssessment(assessment)}>
                    Take
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
