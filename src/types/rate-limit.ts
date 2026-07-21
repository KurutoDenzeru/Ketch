export type GenerationRateLimitedAction =
  | "generateIdea"
  | "regenerateIdea"
  | "regenerateTitles"
  | "generatePitch"
  | "generateMarketValidation"

export type GenerationRateLimitStatus = {
  limit: number
  used: number
  remaining: number
  isExhausted: boolean
  resetsAt: string | null
  windowDays: number
}
