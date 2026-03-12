export type GenerationRateLimitedAction =
  | "generateIdea"
  | "regenerateIdea"
  | "regenerateTitles"

export type GenerationRateLimitStatus = {
  limit: number
  used: number
  remaining: number
  isExhausted: boolean
  resetsAt: string | null
  windowDays: number
}
