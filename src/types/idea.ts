export const ideaCategories = [
  "SaaS",
  "AI Tool",
  "Dev Tool",
  "Mobile App",
] as const

export type IdeaCategory = (typeof ideaCategories)[number]

export type IdeaFacet = "tagline" | "twist"

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
