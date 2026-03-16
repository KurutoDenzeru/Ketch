import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import path from "node:path"

import type {
  GenerationRateLimitStatus,
  GenerationRateLimitedAction,
} from "@/types/rate-limit"

const RATE_LIMIT_WINDOW_DAYS = 7
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_DAYS * 24 * 60 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 3
const STORE_FILE_NAME = "generation-rate-limit.json"

function getDataDirectory() {
  const configuredDirectory = process.env.KETCH_DATA_DIR?.trim()

  if (configuredDirectory) {
    return configuredDirectory
  }

  const homeDirectory = homedir()

  if (process.platform === "darwin" && homeDirectory) {
    return path.join(homeDirectory, "Library", "Application Support", "Ketch")
  }

  if (process.platform === "win32") {
    const appDataDirectory = process.env.APPDATA?.trim()

    if (appDataDirectory) {
      return path.join(appDataDirectory, "Ketch")
    }
  }

  const xdgDataDirectory = process.env.XDG_DATA_HOME?.trim()

  if (xdgDataDirectory) {
    return path.join(xdgDataDirectory, "Ketch")
  }

  if (homeDirectory) {
    return path.join(homeDirectory, ".local", "share", "Ketch")
  }

  return path.join(tmpdir(), "ketch")
}

const STORE_FILE_PATH = path.join(getDataDirectory(), STORE_FILE_NAME)

type GenerationEvent = {
  action: GenerationRateLimitedAction
  createdAt: string
}

type RateLimitStore = {
  events: GenerationEvent[]
}

let operationQueue = Promise.resolve()

function serializeOperation<T>(operation: () => Promise<T>) {
  const nextOperation = operationQueue.then(operation, operation)

  operationQueue = nextOperation.then(
    () => undefined,
    () => undefined
  )

  return nextOperation
}

function normalizeEvents(events: GenerationEvent[], nowMs: number) {
  return events
    .filter((event) => {
      const timestamp = Date.parse(event.createdAt)

      return (
        Number.isFinite(timestamp) && timestamp > nowMs - RATE_LIMIT_WINDOW_MS
      )
    })
    .sort(
      (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
    )
}

function buildStatus(events: GenerationEvent[]): GenerationRateLimitStatus {
  const used = events.length
  const remaining = Math.max(RATE_LIMIT_MAX_REQUESTS - used, 0)
  const resetsAt =
    used >= RATE_LIMIT_MAX_REQUESTS
      ? new Date(
          Date.parse(events[0]!.createdAt) + RATE_LIMIT_WINDOW_MS
        ).toISOString()
      : null

  return {
    limit: RATE_LIMIT_MAX_REQUESTS,
    used,
    remaining,
    isExhausted: remaining === 0,
    resetsAt,
    windowDays: RATE_LIMIT_WINDOW_DAYS,
  }
}

function createRateLimitMessage(status: GenerationRateLimitStatus) {
  const resetLabel = status.resetsAt
    ? new Date(status.resetsAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : `${RATE_LIMIT_WINDOW_DAYS} days from now`

  return `Generation limit reached. Ketch allows ${status.limit} generation actions every ${status.windowDays} days. Try again after ${resetLabel}.`
}

async function readStore() {
  try {
    const raw = await readFile(STORE_FILE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<RateLimitStore>

    return {
      events: Array.isArray(parsed.events)
        ? parsed.events.filter(
            (event): event is GenerationEvent =>
              Boolean(event) &&
              typeof event === "object" &&
              typeof event.action === "string" &&
              typeof event.createdAt === "string"
          )
        : [],
    } satisfies RateLimitStore
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { events: [] } satisfies RateLimitStore
    }

    throw error
  }
}

async function writeStore(store: RateLimitStore) {
  await mkdir(path.dirname(STORE_FILE_PATH), { recursive: true })
  await writeFile(STORE_FILE_PATH, JSON.stringify(store, null, 2), "utf8")
}

async function loadPrunedStore() {
  const nowMs = Date.now()
  const store = await readStore()
  const events = normalizeEvents(store.events, nowMs)

  if (events.length !== store.events.length) {
    await writeStore({ events })
  }

  return events
}

export async function getGenerationRateLimitStatus() {
  return serializeOperation(async () => buildStatus(await loadPrunedStore()))
}

export async function consumeGenerationRateLimitCredit(
  action: GenerationRateLimitedAction
) {
  return serializeOperation(async () => {
    const events = await loadPrunedStore()
    const currentStatus = buildStatus(events)

    if (currentStatus.isExhausted) {
      throw new Error(createRateLimitMessage(currentStatus))
    }

    const nextEvents = [
      ...events,
      { action, createdAt: new Date().toISOString() },
    ]
    await writeStore({ events: nextEvents })

    return buildStatus(nextEvents)
  })
}
