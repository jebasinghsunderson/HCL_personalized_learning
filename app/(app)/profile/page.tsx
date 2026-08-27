"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Save, X } from "lucide-react"

interface ProfileData {
  id: string
  name: string
  email: string
  profile: {
    experienceLevel: string
    weeklyHours: number
    preferredLearningStyle: string
    preferredDifficulty: string
    currentRole: string | null
    interests: { id: string; name: string }[]
    learnerSkills: { id: string; proficiency: number; skill: { name: string; category: string } }[]
    goals: { id: string; title: string; targetRole: string | null; status: string }[]
  } | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    currentRole: "",
    experienceLevel: "intermediate",
    weeklyHours: 5,
    preferredLearningStyle: "mixed",
    preferredDifficulty: "intermediate",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        if (data) {
          setForm({
            name: data.name || "",
            currentRole: data.profile?.currentRole || "",
            experienceLevel: data.profile?.experienceLevel || "intermediate",
            weeklyHours: data.profile?.weeklyHours || 5,
            preferredLearningStyle: data.profile?.preferredLearningStyle || "mixed",
            preferredDifficulty: data.profile?.preferredDifficulty || "intermediate",
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const res = await fetch("/api/profile")
    const data = await res.json()
    setProfile(data)
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 mt-1">Manage your learning preferences</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              {editing ? (
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : (
                <p className="text-sm text-slate-700 mt-1">{profile?.name || "Not set"}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-slate-700 mt-1">{profile?.email}</p>
            </div>
            <div>
              <Label>Current Role</Label>
              {editing ? (
                <Input value={form.currentRole} onChange={e => setForm({ ...form, currentRole: e.target.value })} />
              ) : (
                <p className="text-sm text-slate-700 mt-1">{profile?.profile?.currentRole || "Not set"}</p>
              )}
            </div>
            <div>
              <Label>Experience Level</Label>
              {editing ? (
                <Select value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </Select>
              ) : (
                <p className="text-sm text-slate-700 mt-1 capitalize">{profile?.profile?.experienceLevel || "Not set"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Weekly Hours</Label>
              {editing ? (
                <Input
                  type="number"
                  min={1}
                  max={80}
                  value={form.weeklyHours}
                  onChange={e => setForm({ ...form, weeklyHours: parseInt(e.target.value) || 5 })}
                />
              ) : (
                <p className="text-sm text-slate-700 mt-1">{profile?.profile?.weeklyHours || 5} hours/week</p>
              )}
            </div>
            <div>
              <Label>Learning Style</Label>
              {editing ? (
                <Select value={form.preferredLearningStyle} onChange={e => setForm({ ...form, preferredLearningStyle: e.target.value })}>
                  <option value="visual">Visual</option>
                  <option value="reading">Reading</option>
                  <option value="hands-on">Hands-on</option>
                  <option value="mixed">Mixed</option>
                </Select>
              ) : (
                <p className="text-sm text-slate-700 mt-1 capitalize">{profile?.profile?.preferredLearningStyle || "Mixed"}</p>
              )}
            </div>
            <div>
              <Label>Preferred Difficulty</Label>
              {editing ? (
                <Select value={form.preferredDifficulty} onChange={e => setForm({ ...form, preferredDifficulty: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              ) : (
                <p className="text-sm text-slate-700 mt-1 capitalize">{profile?.profile?.preferredDifficulty || "Intermediate"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile?.profile?.interests && profile.profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.profile.interests.map(interest => (
                <Badge key={interest.id} variant="secondary">{interest.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.profile?.goals && profile.profile.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.profile.goals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{goal.title}</p>
                    {goal.targetRole && (
                      <p className="text-xs text-slate-500">Target: {goal.targetRole}</p>
                    )}
                  </div>
                  <Badge variant={goal.status === "active" ? "success" : "secondary"}>
                    {goal.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
