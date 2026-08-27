"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Heart,
  Brain,
  Settings,
  Target,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  X,
  Plus,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const STEPS = [
  { label: "About You", icon: User },
  { label: "Interests", icon: Heart },
  { label: "Skills", icon: Brain },
  { label: "Preferences", icon: Settings },
  { label: "Goal", icon: Target },
  { label: "Review", icon: CheckCircle },
]

const INTERESTS = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "AI",
  "Cloud Computing",
  "Cybersecurity",
  "Product Management",
  "UI/UX",
]

const AVAILABLE_SKILLS = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "Git",
  "Docker",
  "Machine Learning",
  "Deep Learning",
  "Statistics",
  "Data Visualization",
  "REST APIs",
  "AWS",
  "Linux",
]

interface FormData {
  name: string
  currentRole: string
  experienceLevel: string
  interests: string[]
  customInterest: string
  skills: Array<{ name: string; proficiency: number }>
  weeklyHours: number
  preferredLearningStyle: string
  preferredDifficulty: string
  goalText: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    currentRole: "",
    experienceLevel: "beginner",
    interests: [],
    customInterest: "",
    skills: [],
    weeklyHours: 10,
    preferredLearningStyle: "mixed",
    preferredDifficulty: "intermediate",
    goalText: "",
  })

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100

  function updateForm<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleInterest(interest: string) {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  function addCustomInterest() {
    const trimmed = formData.customInterest.trim()
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
        customInterest: "",
      }))
    }
  }

  function toggleSkill(skillName: string) {
    setFormData((prev) => {
      const exists = prev.skills.find((s) => s.name === skillName)
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s.name !== skillName) }
      }
      return { ...prev, skills: [...prev.skills, { name: skillName, proficiency: 2 }] }
    })
  }

  function setSkillProficiency(skillName: string, proficiency: number) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) =>
        s.name === skillName ? { ...s, proficiency } : s
      ),
    }))
  }

  function canGoNext(): boolean {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0
      case 1:
        return formData.interests.length > 0
      case 2:
        return true // Skills are optional
      case 3:
        return formData.weeklyHours > 0
      case 4:
        return formData.goalText.trim().length >= 5
      case 5:
        return true
      default:
        return false
    }
  }

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      // Update profile
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          currentRole: formData.currentRole,
          experienceLevel: formData.experienceLevel,
          weeklyHours: formData.weeklyHours,
          preferredLearningStyle: formData.preferredLearningStyle,
          preferredDifficulty: formData.preferredDifficulty,
          interests: formData.interests,
          skills: formData.skills,
        }),
      })

      // Analyze goal
      await fetch("/api/goals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText: formData.goalText }),
      })

      // Generate learning path
      await fetch("/api/learning-path/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding submission failed:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <div key={step.label} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white scale-110"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          <Progress value={progressPercent} />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[currentStep].label}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Tell us a bit about yourself so we can personalize your experience."}
              {currentStep === 1 && "What areas are you most interested in learning?"}
              {currentStep === 2 && "What skills do you already have? Rate your proficiency for each."}
              {currentStep === 3 && "How do you prefer to learn? This helps us recommend the right resources."}
              {currentStep === 4 && "Describe your learning goal in your own words."}
              {currentStep === 5 && "Review your information before we generate your personalized learning path."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="transition-all duration-300">
              {/* Step 1: About You */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Current Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Software Developer, Student, Marketing Manager"
                      value={formData.currentRole}
                      onChange={(e) => updateForm("currentRole", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      id="experience"
                      value={formData.experienceLevel}
                      onChange={(e) => updateForm("experienceLevel", e.target.value)}
                    >
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3-7 years)</option>
                      <option value="expert">Expert (7+ years)</option>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const selected = formData.interests.includes(interest)
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            selected
                              ? "bg-slate-900 text-white shadow-md"
                              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {interest}
                          {selected && <X className="ml-1.5 h-3.5 w-3.5" />}
                        </button>
                      )
                    })}
                  </div>
                  {/* Custom interests already added */}
                  {formData.interests
                    .filter((i) => !INTERESTS.includes(i))
                    .map((interest) => (
                      <Badge
                        key={interest}
                        variant="default"
                        className="mr-2 cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  {/* Add custom interest */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Add a custom interest..."
                      value={formData.customInterest}
                      onChange={(e) => updateForm("customInterest", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCustomInterest()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addCustomInterest}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const selected = formData.skills.some((s) => s.name === skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                            selected
                              ? "bg-emerald-600 text-white"
                              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                  {/* Proficiency sliders for selected skills */}
                  {formData.skills.length > 0 && (
                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <p className="text-sm font-medium text-slate-700">
                        Rate your proficiency (1 = beginner, 5 = expert):
                      </p>
                      {formData.skills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-3">
                          <span className="text-sm w-32 truncate font-medium text-slate-600">
                            {skill.name}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setSkillProficiency(skill.name, level)}
                                className={`h-8 w-8 rounded-md text-sm font-medium transition-all ${
                                  level <= skill.proficiency
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSkill(skill.name)}
                            className="ml-auto text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Learning Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours per week available for learning</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="hours"
                        type="number"
                        min={1}
                        max={40}
                        value={formData.weeklyHours}
                        onChange={(e) =>
                          updateForm("weeklyHours", parseInt(e.target.value) || 1)
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-slate-500">hours/week</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Learning Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "visual", label: "Visual", desc: "Videos, diagrams, infographics" },
                        { value: "reading", label: "Reading", desc: "Articles, documentation, books" },
                        { value: "hands-on", label: "Hands-on", desc: "Projects, exercises, labs" },
                        { value: "mixed", label: "Mixed", desc: "Combination of all styles" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => updateForm("preferredLearningStyle", style.value)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            formData.preferredLearningStyle === style.value
                              ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-sm font-medium text-slate-900">{style.label}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Preferred Difficulty</Label>
                    <Select
                      id="difficulty"
                      value={formData.preferredDifficulty}
                      onChange={(e) => updateForm("preferredDifficulty", e.target.value)}
                    >
                      <option value="beginner">Beginner - Start from basics</option>
                      <option value="intermediate">Intermediate - Some prior knowledge</option>
                      <option value="advanced">Advanced - Challenge me</option>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 5: Goal */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Your Learning Goal</Label>
                    <Textarea
                      id="goal"
                      placeholder="e.g., I want to become a machine learning engineer within 6 months, starting from my current background in web development..."
                      value={formData.goalText}
                      onChange={(e) => updateForm("goalText", e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-slate-500">
                      Be as specific as possible. Include your target role, timeline, and any context about your background.
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <div className="flex gap-3">
                      <Sparkles className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI-Powered Path Generation</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Our AI will analyze your goal, current skills, and preferences to create a personalized
                          learning path with curated resources and milestones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Name & Role</h4>
                      <p className="font-medium text-slate-900">{formData.name}</p>
                      {formData.currentRole && (
                        <p className="text-sm text-slate-600">{formData.currentRole}</p>
                      )}
                      <Badge variant="secondary" className="mt-1">
                        {formData.experienceLevel}
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.interests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {formData.skills.length > 0 && (
                      <div className="rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Skills</h4>
                        <div className="space-y-1.5">
                          {formData.skills.map((skill) => (
                            <div key={skill.name} className="flex items-center justify-between">
                              <span className="text-sm text-slate-700">{skill.name}</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-2 w-4 rounded-sm ${
                                      level <= skill.proficiency ? "bg-emerald-500" : "bg-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Learning Preferences</h4>
                      <p className="text-sm text-slate-700">
                        {formData.weeklyHours} hours/week | {formData.preferredLearningStyle} style |{" "}
                        {formData.preferredDifficulty} difficulty
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Goal</h4>
                      <p className="text-sm text-slate-700">{formData.goalText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canGoNext()} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Your Path...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Learning Path
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
