import type { ShareableIdeaPayload } from "@/types/idea"

const STORAGE_KEY = "ketch:shared-links"
const MAX_LINKS = 50

type StoredLink = {
  shareId: string
  payload: ShareableIdeaPayload
  createdAt: string
  views: number
}

function isBrowser() {
  return typeof window !== "undefined"
}

function isStoredLink(value: unknown): value is StoredLink {
  if (!value || typeof value !== "object") {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.shareId === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.views === "number" &&
    candidate.payload !== null &&
    typeof candidate.payload === "object"
  )
}

function readAll(): Array<StoredLink> {
  if (!isBrowser()) {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isStoredLink) : []
  } catch {
    return []
  }
}

function writeAll(links: Array<StoredLink>) {
  if (!isBrowser()) {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}

export function getSharedLinks(): Array<StoredLink> {
  return readAll()
}

export function recordSharedLink(shareId: string, payload: ShareableIdeaPayload) {
  if (!isBrowser()) {
    return
  }
  const existing = readAll()
  const without = existing.filter((link) => link.shareId !== shareId)
  const next: Array<StoredLink> = [
    {
      shareId,
      payload,
      createdAt: new Date().toISOString(),
      views: 0,
    },
    ...without,
  ].slice(0, MAX_LINKS)
  writeAll(next)
}

export function removeSharedLink(shareId: string) {
  const next = readAll().filter((link) => link.shareId !== shareId)
  writeAll(next)
}

export function clearSharedLinks() {
  if (!isBrowser()) {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}
