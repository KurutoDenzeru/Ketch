export const ideaCategories = [
  "SaaS",
  "AI Tool",
  "Dev Tool",
  "Mobile App",
] as const

export type IdeaCategory = (typeof ideaCategories)[number]

export type IdeaFacet = "tagline" | "twist"

export type IdeaBriefInput = {
  category: IdeaCategory
  concept: string
  problem: string
  audience: string
  founderEdge: string
  constraints: string
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
