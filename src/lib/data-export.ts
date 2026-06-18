import type { getSavedIdeas } from "@/lib/idea-storage";
import type { SavedIdea } from "@/types/idea"
import { formatIdeaAsMarkdown, formatIdeaForClipboard } from "@/lib/idea-storage"

const EXPORT_VERSION = 1

export type ExportPayload = {
  version: number
  exportedAt: string
  ideas: Array<SavedIdea>
}

export function exportIdeasAsJson(ideas: Array<SavedIdea>): string {
  const payload: ExportPayload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    ideas,
  }
  return JSON.stringify(payload, null, 2)
}

export function exportIdeasAsMarkdown(ideas: Array<SavedIdea>): string {
  return ideas
    .map((idea) =>
      formatIdeaAsMarkdown({
        idea: idea.idea,
        pitch: idea.pitch,
        marketValidation: idea.marketValidation,
      })
    )
    .join("\n\n---\n\n")
}

export function exportIdeasAsText(ideas: Array<SavedIdea>): string {
  return ideas
    .map((idea) =>
      formatIdeaForClipboard({
        idea: idea.idea,
        pitch: idea.pitch,
        marketValidation: idea.marketValidation,
      })
    )
    .join("\n\n---\n\n")
}

export type ImportResult =
  | { ok: true; ideas: Array<SavedIdea>; count: number }
  | { ok: false; error: string }

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

function isStartupIdea(value: unknown): boolean {
  if (!isObject(value)) {
    return false
  }
  return (
    isString(value.name) &&
    isString(value.tagline) &&
    isString(value.description) &&
    typeof value.validationScore === "number" &&
    Array.isArray(value.alternativeNames)
  )
}

function isSavedIdea(value: unknown): value is SavedIdea {
  if (!isObject(value)) {
    return false
  }
  return (
    isString(value.id) &&
    isString(value.createdAt) &&
    isStartupIdea(value.idea)
  )
}

export function parseImport(raw: string): ImportResult {
  if (!raw.trim()) {
    return { ok: false, error: "Empty file. Nothing to import." }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: "File isn't valid JSON. Check the export and try again." }
  }

  let ideas: Array<unknown> = []
  if (Array.isArray(parsed)) {
    ideas = parsed
  } else if (isObject(parsed) && Array.isArray(parsed.ideas)) {
    ideas = parsed.ideas
  } else {
    return { ok: false, error: "Unrecognized export shape. Expected an array or { ideas: [...] }." }
  }

  const validIdeas = ideas.filter(isSavedIdea)
  if (validIdeas.length === 0) {
    return { ok: false, error: "No valid ideas found in the file." }
  }
  return { ok: true, ideas: validIdeas, count: validIdeas.length }
}

export function estimateStorageBytes(ideas: ReturnType<typeof getSavedIdeas>): number {
  try {
    return new Blob([JSON.stringify(ideas)]).size
  } catch {
    return 0
  }
}
