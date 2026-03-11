export const ideaCategories = [
  "SaaS",
  "AI Tool",
  "Dev Tool",
  "Mobile App",
  "Marketplace",
  "Fintech",
  "Healthcare",
  "Creator Tool",
  "Education",
  "E-commerce",
  "Cybersecurity",
  "Climate",
  "Consumer Social",
  "Operations",
] as const

export type IdeaCategory = (typeof ideaCategories)[number]

export type IdeaFacet = "tagline" | "twist"

export const featurePreferences = [
  "Fast MVP",
  "Recurring Revenue",
  "Viral Loop",
  "AI Automation",
  "B2B Workflow",
  "Mobile First",
  "Community Driven",
  "Low Competition",
] as const

export type FeaturePreference = (typeof featurePreferences)[number]

export const categoryFocusOptions: Record<IdeaCategory, string[]> = {
  SaaS: ["Internal tools", "Team productivity", "Vertical SaaS", "Analytics"],
  "AI Tool": [
    "Agent workflow",
    "Content generation",
    "Research assistant",
    "AI copilots",
  ],
  "Dev Tool": ["CI/CD", "Observability", "Testing", "Developer productivity"],
  "Mobile App": [
    "Habit tracker",
    "Consumer utility",
    "Wellness",
    "Local discovery",
  ],
  Marketplace: [
    "B2B matching",
    "Services marketplace",
    "Niche communities",
    "Local supply",
  ],
  Fintech: [
    "Expense management",
    "Embedded finance",
    "SMB finance",
    "Personal wealth",
  ],
  Healthcare: [
    "Practice operations",
    "Patient engagement",
    "Mental health",
    "Compliance workflow",
  ],
  "Creator Tool": [
    "Audience growth",
    "Monetization",
    "Editing workflow",
    "Content planning",
  ],
  Education: ["Upskilling", "Test prep", "Micro-learning", "School workflow"],
  "E-commerce": [
    "Store optimization",
    "Post-purchase",
    "Creator commerce",
    "Inventory workflow",
  ],
  Cybersecurity: [
    "Security training",
    "AppSec",
    "Identity",
    "Threat detection",
  ],
  Climate: [
    "Energy efficiency",
    "Carbon tracking",
    "Climate adaptation",
    "Circular economy",
  ],
  "Consumer Social": [
    "Interest graph",
    "Messaging",
    "Status sharing",
    "Creator community",
  ],
  Operations: [
    "Back-office automation",
    "Scheduling",
    "Field operations",
    "Documentation workflow",
  ],
}

export type IdeaBriefInput = {
  category: IdeaCategory
  concept: string
  problem: string
  audience: string
  categoryFocus: string
  featurePreferences: FeaturePreference[]
}

export type IdeaScoreMetric = {
  label: string
  score: number
  insight: string
}

export type IdeaTrendPoint = {
  label: string
  interest: number
}

export type IdeaKeywordSignal = {
  term: string
  volume: string
  competition: string
  score: number
}

export type IdeaValueLadderStep = {
  label: string
  score: number
}

export type DetailedPlanStep = {
  phase: string
  timeframe: string
  objective: string
  actions: string[]
  outcome: string
}

export type IdeaAnalysis = {
  tags: string[]
  whyNow: string
  proofSignals: string[]
  marketGap: string
  executionPlan: string
  scoreMetrics: IdeaScoreMetric[]
  trendPoints: IdeaTrendPoint[]
  frameworkFit: {
    audience: number
    community: number
    product: number
  }
  valueLadder: IdeaValueLadderStep[]
  keywordSignals: IdeaKeywordSignal[]
  detailedPlan: DetailedPlanStep[]
}

export type StartupIdea = {
  name: string
  tagline: string
  description: string
  audience: string
  twist: string
  monetization: string
  validationScore: number
  alternativeNames: string[]
  category: IdeaCategory
  analysis: IdeaAnalysis
}

export type StartupPitch = {
  problem: string
  solution: string
  market: string
  businessModel: string
}

export type MarketValidation = {
  competition: string[]
  risks: string[]
  potentialUsers: string[]
  verdict: string
}

export type ShareableIdeaPayload = {
  idea: StartupIdea
  pitch?: StartupPitch | null
  marketValidation?: MarketValidation | null
}

export type SavedIdea = ShareableIdeaPayload & {
  id: string
  createdAt: string
}
