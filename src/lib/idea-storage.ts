import type { SavedIdea, ShareableIdeaPayload, StartupIdea } from "@/types/idea"

const STORAGE_KEY = "ai-startup-idea-lab:saved-ideas"

function isBrowser() {
  return typeof window !== "undefined"
}

function getIdeaFingerprint(idea: StartupIdea) {
  return [idea.name, idea.tagline, idea.twist]
    .map((part) => part.trim().toLowerCase())
    .join("::")
}

function createIdeaId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `idea-${Date.now()}`
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  )
}

function isStartupIdea(value: unknown): value is StartupIdea {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>
  const analysis =
    candidate.analysis && typeof candidate.analysis === "object"
      ? (candidate.analysis as Record<string, unknown>)
      : null
  const frameworkFit =
    analysis?.frameworkFit && typeof analysis.frameworkFit === "object"
      ? (analysis.frameworkFit as Record<string, unknown>)
      : null

  return (
    isString(candidate.name) &&
    isString(candidate.tagline) &&
    isString(candidate.description) &&
    isString(candidate.audience) &&
    isString(candidate.twist) &&
    isString(candidate.monetization) &&
    typeof candidate.validationScore === "number" &&
    isStringArray(candidate.alternativeNames) &&
    isString(candidate.category) &&
    analysis !== null &&
    isStringArray(analysis.tags) &&
    isString(analysis.whyNow) &&
    isStringArray(analysis.proofSignals) &&
    isString(analysis.marketGap) &&
    isString(analysis.executionPlan) &&
    Array.isArray(analysis.scoreMetrics) &&
    Array.isArray(analysis.trendPoints) &&
    frameworkFit !== null &&
    typeof frameworkFit.audience === "number" &&
    typeof frameworkFit.community === "number" &&
    typeof frameworkFit.product === "number" &&
    Array.isArray(analysis.valueLadder) &&
    Array.isArray(analysis.keywordSignals) &&
    Array.isArray(analysis.detailedPlan)
  )
}

function isPitch(value: unknown) {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isString(candidate.problem) &&
    isString(candidate.solution) &&
    isString(candidate.market) &&
    isString(candidate.businessModel)
  )
}

function isMarketValidation(value: unknown) {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isStringArray(candidate.competition) &&
    isStringArray(candidate.risks) &&
    isStringArray(candidate.potentialUsers) &&
    isString(candidate.verdict)
  )
}

function isShareableIdeaPayload(value: unknown): value is ShareableIdeaPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isStartupIdea(candidate.idea) &&
    (candidate.pitch === undefined ||
      candidate.pitch === null ||
      isPitch(candidate.pitch)) &&
    (candidate.marketValidation === undefined ||
      candidate.marketValidation === null ||
      isMarketValidation(candidate.marketValidation))
  )
}

function isSavedIdea(value: unknown): value is SavedIdea {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isString(candidate.id) &&
    isString(candidate.createdAt) &&
    isShareableIdeaPayload(candidate)
  )
}

export function getSavedIdeas() {
  if (!isBrowser()) {
    return [] as SavedIdea[]
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return [] as SavedIdea[]
  }

  try {
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed.filter(isSavedIdea) : []
  } catch {
    return [] as SavedIdea[]
  }
}

function writeSavedIdeas(ideas: SavedIdea[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
}

export function saveIdea(payload: ShareableIdeaPayload) {
  const existingIdeas = getSavedIdeas()
  const fingerprint = getIdeaFingerprint(payload.idea)
  const existingIdea = existingIdeas.find(
    (idea) => getIdeaFingerprint(idea.idea) === fingerprint
  )

  const nextIdea: SavedIdea = {
    id: existingIdea?.id ?? createIdeaId(),
    createdAt: existingIdea?.createdAt ?? new Date().toISOString(),
    ...payload,
  }

  const nextIdeas = existingIdeas.filter(
    (idea) => getIdeaFingerprint(idea.idea) !== fingerprint
  )

  nextIdeas.unshift(nextIdea)
  writeSavedIdeas(nextIdeas)

  return nextIdea
}

export function removeIdea(id: string) {
  const nextIdeas = getSavedIdeas().filter((idea) => idea.id !== id)
  writeSavedIdeas(nextIdeas)
  return nextIdeas
}

export function isIdeaSaved(idea: StartupIdea) {
  const fingerprint = getIdeaFingerprint(idea)
  return getSavedIdeas().some(
    (savedIdea) => getIdeaFingerprint(savedIdea.idea) === fingerprint
  )
}

export function encodeIdeaForUrl(payload: ShareableIdeaPayload) {
  return encodeURIComponent(JSON.stringify(payload))
}

export function decodeIdeaFromUrl(data: string) {
  try {
    const parsed = JSON.parse(decodeURIComponent(data))
    if (!isShareableIdeaPayload(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function buildIdeaSharePath(payload: ShareableIdeaPayload) {
  return `/idea?data=${encodeIdeaForUrl(payload)}`
}

export function buildIdeaShareUrl(payload: ShareableIdeaPayload) {
  const sharePath = buildIdeaSharePath(payload)

  if (!isBrowser()) {
    return sharePath
  }

  return `${window.location.origin}${sharePath}`
}

export function formatIdeaForClipboard(payload: ShareableIdeaPayload) {
  const lines = [
    payload.idea.name,
    payload.idea.tagline,
    "",
    `Description: ${payload.idea.description}`,
    `Audience: ${payload.idea.audience}`,
    `Unique twist: ${payload.idea.twist}`,
    `Monetization: ${payload.idea.monetization}`,
    `Validation score: ${payload.idea.validationScore}/10`,
    `Alternative names: ${payload.idea.alternativeNames.join(", ")}`,
    `Tags: ${payload.idea.analysis.tags.join(", ")}`,
    "",
    "Why Now",
    payload.idea.analysis.whyNow,
    "",
    "Proof & Signals",
    ...payload.idea.analysis.proofSignals.map((item) => `- ${item}`),
    "",
    "Market Gap",
    payload.idea.analysis.marketGap,
    "",
    "Execution Plan",
    payload.idea.analysis.executionPlan,
  ]

  if (payload.pitch) {
    lines.push(
      "",
      "Pitch",
      `Problem: ${payload.pitch.problem}`,
      `Solution: ${payload.pitch.solution}`,
      `Market: ${payload.pitch.market}`,
      `Business model: ${payload.pitch.businessModel}`
    )
  }

  if (payload.marketValidation) {
    lines.push(
      "",
      "AI Market Validation",
      `Competition: ${payload.marketValidation.competition.join(", ")}`,
      `Risks: ${payload.marketValidation.risks.join(", ")}`,
      `Potential users: ${payload.marketValidation.potentialUsers.join(", ")}`,
      `Verdict: ${payload.marketValidation.verdict}`
    )
  }

  return lines.join("\n")
}
