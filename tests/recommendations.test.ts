describe("Recommendation Engine Scoring", () => {
  it("should score goal-relevant resources higher", () => {
    const goalSkills = new Set(["Python", "Machine Learning", "Docker"])

    function scoreGoalRelevance(resourceSkills: string[], goalSkills: Set<string>) {
      const relevant = resourceSkills.filter(s => goalSkills.has(s))
      return goalSkills.size > 0
        ? relevant.length / Math.min(resourceSkills.length || 1, goalSkills.size)
        : 0.3
    }

    const highRelevance = scoreGoalRelevance(["Python", "Machine Learning"], goalSkills)
    const lowRelevance = scoreGoalRelevance(["HTML", "CSS"], goalSkills)

    expect(highRelevance).toBeGreaterThan(lowRelevance)
    expect(highRelevance).toBeGreaterThan(0.5)
    expect(lowRelevance).toBe(0)
  })

  it("should exclude completed resources", () => {
    const completedResourceIds = new Set(["res-1", "res-3"])
    const resources = [
      { id: "res-1", title: "Done" },
      { id: "res-2", title: "Not Done" },
      { id: "res-3", title: "Also Done" },
    ]

    const filtered = resources.filter(r => !completedResourceIds.has(r.id))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("res-2")
  })

  it("should lower score when prerequisites are not met", () => {
    function calculatePrereqMatch(
      resourceSkills: string[],
      prereqMap: Map<string, string[]>,
      currentSkillMap: Map<string, number>
    ) {
      let match = 1
      for (const skillName of resourceSkills) {
        const prereqs = prereqMap.get(skillName) || []
        for (const prereq of prereqs) {
          const level = currentSkillMap.get(prereq) || 0
          if (level < 2) match -= 0.3
        }
      }
      return Math.max(0, match)
    }

    const prereqMap = new Map([["Machine Learning", ["Python", "Statistics"]]])
    const withPrereqs = new Map([["Python", 4], ["Statistics", 3]])
    const withoutPrereqs = new Map([["Python", 0], ["Statistics", 0]])

    const matchWithPrereqs = calculatePrereqMatch(["Machine Learning"], prereqMap, withPrereqs)
    const matchWithout = calculatePrereqMatch(["Machine Learning"], prereqMap, withoutPrereqs)

    expect(matchWithPrereqs).toBeGreaterThan(matchWithout)
    expect(matchWithPrereqs).toBe(1)
    expect(matchWithout).toBeLessThan(0.5)
  })

  it("should adjust score based on feedback", () => {
    function feedbackAdjustment(
      resourceId: string,
      negativeFeedback: Set<string>,
      positiveFeedback: Set<string>
    ) {
      if (negativeFeedback.has(resourceId)) return -0.5
      if (positiveFeedback.has(resourceId)) return 0.5
      return 0
    }

    const negative = new Set(["bad-resource"])
    const positive = new Set(["good-resource"])

    expect(feedbackAdjustment("bad-resource", negative, positive)).toBe(-0.5)
    expect(feedbackAdjustment("good-resource", negative, positive)).toBe(0.5)
    expect(feedbackAdjustment("neutral", negative, positive)).toBe(0)
  })
})

describe("Skill Gap Analysis", () => {
  it("should correctly identify missing skills", () => {
    const currentSkills = new Map([["Python", 3], ["SQL", 2]])
    const requiredSkills = ["Python", "SQL", "Machine Learning", "Docker"]

    const gaps = requiredSkills
      .map(skill => ({
        skill,
        current: currentSkills.get(skill) || 0,
        required: 4,
        gap: 4 - (currentSkills.get(skill) || 0),
      }))
      .filter(g => g.gap > 0)

    expect(gaps).toHaveLength(4)
    expect(gaps.find(g => g.skill === "Machine Learning")?.gap).toBe(4)
    expect(gaps.find(g => g.skill === "Python")?.gap).toBe(1)
  })

  it("should handle existing skills correctly", () => {
    const currentSkills = new Map([["Python", 5], ["JavaScript", 4]])
    const requiredSkills = ["Python", "JavaScript"]

    const gaps = requiredSkills
      .map(skill => ({
        skill,
        current: currentSkills.get(skill) || 0,
        required: 4,
        gap: Math.max(0, 4 - (currentSkills.get(skill) || 0)),
      }))
      .filter(g => g.gap > 0)

    expect(gaps).toHaveLength(0)
  })

  it("should calculate correct priority based on gap", () => {
    function calculatePriority(gap: number, isCore: boolean): string {
      if (gap >= 4 && isCore) return "critical"
      if (gap >= 3) return "high"
      if (gap >= 2) return "medium"
      return "low"
    }

    expect(calculatePriority(4, true)).toBe("critical")
    expect(calculatePriority(4, false)).toBe("high")
    expect(calculatePriority(3, false)).toBe("high")
    expect(calculatePriority(2, false)).toBe("medium")
    expect(calculatePriority(1, false)).toBe("low")
  })
})

describe("Learning Path Generation", () => {
  it("should respect prerequisite ordering", () => {
    function topologicalSort(skills: string[], prereqMap: Map<string, string[]>): string[] {
      const visited = new Set<string>()
      const result: string[] = []

      function visit(skill: string) {
        if (visited.has(skill)) return
        visited.add(skill)
        const prereqs = prereqMap.get(skill) || []
        for (const prereq of prereqs) {
          if (skills.includes(prereq)) visit(prereq)
        }
        result.push(skill)
      }

      for (const skill of skills) visit(skill)
      return result
    }

    const prereqMap = new Map([
      ["Machine Learning", ["Python", "Statistics"]],
      ["Deep Learning", ["Machine Learning"]],
      ["Statistics", ["Python"]],
    ])

    const sorted = topologicalSort(
      ["Deep Learning", "Machine Learning", "Python", "Statistics"],
      prereqMap
    )

    const pythonIdx = sorted.indexOf("Python")
    const statsIdx = sorted.indexOf("Statistics")
    const mlIdx = sorted.indexOf("Machine Learning")
    const dlIdx = sorted.indexOf("Deep Learning")

    expect(pythonIdx).toBeLessThan(statsIdx)
    expect(statsIdx).toBeLessThan(mlIdx)
    expect(mlIdx).toBeLessThan(dlIdx)
  })

  it("should mark items as locked when prerequisites are not met", () => {
    const currentSkills = new Map([["Python", 3]])
    const items = [
      { skill: "Python", order: 1 },
      { skill: "Statistics", order: 2 },
      { skill: "Machine Learning", order: 3 },
    ]
    const prereqMap = new Map([
      ["Statistics", ["Python"]],
      ["Machine Learning", ["Statistics"]],
    ])

    const statuses = items.map(item => {
      if (item.order === 1) return "not_started"
      const prereqs = prereqMap.get(item.skill) || []
      const hasPrereqs = prereqs.every(p => (currentSkills.get(p) || 0) >= 2)
      return hasPrereqs ? "not_started" : "locked"
    })

    expect(statuses[0]).toBe("not_started")
    expect(statuses[1]).toBe("not_started") // Has Python prereq
    expect(statuses[2]).toBe("locked") // Statistics not completed yet
  })
})
