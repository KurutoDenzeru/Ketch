import type { StartupIdea } from "@/types/idea"

export type ActivityEventKind =
  | "idea_generated"
  | "idea_saved"
  | "idea_removed"
  | "link_shared"
  | "link_viewed"
  | "brief_updated"

export type ActivityEvent = {
  id: string
  kind: ActivityEventKind
  ideaId?: string
  ideaName?: string
  shareId?: string
  at: string
}

const STORAGE_KEY = "ketch:activity-log"
const MAX_EVENTS = 100

function isBrowser() {
  return typeof window !== "undefined"
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

function isActivityEvent(value: unknown): value is ActivityEvent {
  if (!value || typeof value !== "object") {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    isString(candidate.id) &&
    isString(candidate.kind) &&
    isString(candidate.at) &&
    (candidate.ideaId === undefined || isString(candidate.ideaId)) &&
    (candidate.ideaName === undefined || isString(candidate.ideaName)) &&
    (candidate.shareId === undefined || isString(candidate.shareId))
  )
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getActivityLog(): Array<ActivityEvent> {
  if (!isBrowser()) {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isActivityEvent) : []
  } catch {
    return []
  }
}

function writeLog(events: Array<ActivityEvent>) {
  if (!isBrowser()) {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export function recordActivity(
  kind: ActivityEventKind,
  input: { idea?: Pick<StartupIdea, "name">; ideaId?: string; shareId?: string } = {}
) {
  if (!isBrowser()) {
    return null
  }
  const event: ActivityEvent = {
    id: createId(),
    kind,
    at: new Date().toISOString(),
    ideaId: input.ideaId,
    ideaName: input.idea?.name,
    shareId: input.shareId,
  }
  const next = [event, ...getActivityLog()].slice(0, MAX_EVENTS)
  writeLog(next)
  return event
}

export function clearActivityLog() {
  if (!isBrowser()) {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}
