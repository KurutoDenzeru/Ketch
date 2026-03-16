import LZString from "lz-string"

import {
  ideaCategories,
  type IdeaBriefInput,
  type IdeaLabDraft,
  type SavedIdea,
  type ShareableIdeaPayload,
  type StartupIdea,
} from "@/types/idea"

const STORAGE_KEY = "ai-startup-idea-lab:saved-ideas"
const DRAFT_STORAGE_KEY = "ai-startup-idea-lab:current-draft"
const SHARED_IDEA_STORAGE_KEY = "ai-startup-idea-lab:shared-idea"

function isBrowser() {
  return typeof window !== "undefined"
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return normalized || "shared-idea"
}

export function createIdeaShareSlug(idea: StartupIdea) {
  return `${slugify(idea.name)}-${slugify(idea.category)}`
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

function isIdeaBriefInput(value: unknown): value is IdeaBriefInput {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.category === "string" &&
    ideaCategories.includes(
      candidate.category as (typeof ideaCategories)[number]
    ) &&
    typeof candidate.concept === "string" &&
    typeof candidate.problem === "string" &&
    typeof candidate.audience === "string" &&
    typeof candidate.categoryFocus === "string" &&
    Array.isArray(candidate.featurePreferences) &&
    candidate.featurePreferences.every((item) => typeof item === "string")
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

function isIdeaLabDraft(value: unknown): value is IdeaLabDraft {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isIdeaBriefInput(candidate.brief) &&
    (candidate.idea === undefined ||
      candidate.idea === null ||
      isStartupIdea(candidate.idea)) &&
    (candidate.pitch === undefined ||
      candidate.pitch === null ||
      isPitch(candidate.pitch)) &&
    (candidate.marketValidation === undefined ||
      candidate.marketValidation === null ||
      isMarketValidation(candidate.marketValidation))
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

export function updateSavedIdea(id: string, payload: ShareableIdeaPayload) {
  const existingIdeas = getSavedIdeas()
  const currentIdea = existingIdeas.find((idea) => idea.id === id)

  if (!currentIdea) {
    return saveIdea(payload)
  }

  const nextIdea: SavedIdea = {
    id,
    createdAt: currentIdea.createdAt,
    ...payload,
  }

  const nextIdeas = existingIdeas.map((idea) =>
    idea.id === id ? nextIdea : idea
  )
  writeSavedIdeas(nextIdeas)

  return nextIdea
}

export function removeIdea(id: string) {
  const nextIdeas = getSavedIdeas().filter((idea) => idea.id !== id)
  writeSavedIdeas(nextIdeas)
  return nextIdeas
}

export function getSavedIdeaByIdea(idea: StartupIdea) {
  const fingerprint = getIdeaFingerprint(idea)
  return (
    getSavedIdeas().find(
      (savedIdea) => getIdeaFingerprint(savedIdea.idea) === fingerprint
    ) ?? null
  )
}

export function removeIdeaByIdea(idea: StartupIdea) {
  const savedIdea = getSavedIdeaByIdea(idea)

  if (!savedIdea) {
    return getSavedIdeas()
  }

  return removeIdea(savedIdea.id)
}

export function isIdeaSaved(idea: StartupIdea) {
  const fingerprint = getIdeaFingerprint(idea)
  return getSavedIdeas().some(
    (savedIdea) => getIdeaFingerprint(savedIdea.idea) === fingerprint
  )
}

export function getIdeaLabDraft() {
  if (!isBrowser()) {
    return null as IdeaLabDraft | null
  }

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)

  if (!raw) {
    return null as IdeaLabDraft | null
  }

  try {
    const parsed = JSON.parse(raw)
    return isIdeaLabDraft(parsed) ? parsed : null
  } catch {
    return null as IdeaLabDraft | null
  }
}

export function saveIdeaLabDraft(draft: IdeaLabDraft) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function clearIdeaLabDraft() {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY)
}

type SharedIdeaState = {
  shareId: string
  payload: ShareableIdeaPayload
  viewedAt: string
}

function isSharedIdeaState(value: unknown): value is SharedIdeaState {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    isString(candidate.shareId) &&
    isString(candidate.viewedAt) &&
    isShareableIdeaPayload(candidate.payload)
  )
}

export function getRecentSharedIdea() {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(SHARED_IDEA_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    return isSharedIdeaState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveRecentSharedIdea(
  shareId: string,
  payload: ShareableIdeaPayload
) {
  if (!isBrowser()) {
    return null
  }

  const state: SharedIdeaState = {
    shareId,
    payload,
    viewedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(SHARED_IDEA_STORAGE_KEY, JSON.stringify(state))

  return state
}

export function clearRecentSharedIdea() {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(SHARED_IDEA_STORAGE_KEY)
}

export function encodeIdeaForUrl(payload: ShareableIdeaPayload) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeIdeaFromUrl(data: string) {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(data)
    const rawPayload = decompressed ?? decodeURIComponent(data)
    const parsed = JSON.parse(rawPayload)

    if (!isShareableIdeaPayload(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function buildIdeaSharePath(payload: ShareableIdeaPayload) {
  const shareSlug = createIdeaShareSlug(payload.idea)

  return `/idea/${shareSlug}?data=${encodeIdeaForUrl(payload)}`
}

export function buildSharedIdeaPath(shareId: string) {
  return `/idea/${shareId}`
}

export function buildSharedIdeaUrl(shareId: string) {
  const sharePath = buildSharedIdeaPath(shareId)

  if (!isBrowser()) {
    return sharePath
  }

  return `${window.location.origin}${sharePath}`
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
