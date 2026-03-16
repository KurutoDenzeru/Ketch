import { mkdir, readFile, writeFile } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import { homedir, tmpdir } from "node:os"
import path from "node:path"

import { createServerFn } from "@tanstack/react-start"

import { createIdeaShareSlug } from "@/lib/idea-storage"
import type { ShareableIdeaPayload } from "@/types/idea"

const STORE_FILE_PATH = path.join(getDataDirectory(), "shared-ideas.json")

type SharedIdeaRecord = {
  id: string
  shareId: string
  payload: ShareableIdeaPayload
  createdAt: string
}

type SharedIdeaStore = {
  items: SharedIdeaRecord[]
}

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

async function readStore() {
  try {
    const raw = await readFile(STORE_FILE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<SharedIdeaStore>

    return {
      items: Array.isArray(parsed.items)
        ? parsed.items.filter(
            (item): item is SharedIdeaRecord =>
              Boolean(item) &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.shareId === "string" &&
              typeof item.createdAt === "string" &&
              Boolean(item.payload)
          )
        : [],
    } satisfies SharedIdeaStore
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { items: [] } satisfies SharedIdeaStore
    }

    throw error
  }
}

async function writeStore(store: SharedIdeaStore) {
  await mkdir(path.dirname(STORE_FILE_PATH), { recursive: true })
  await writeFile(STORE_FILE_PATH, JSON.stringify(store, null, 2), "utf8")
}

export const createSharedIdeaLink = createServerFn({ method: "POST" })
  .inputValidator((input: { payload: ShareableIdeaPayload }) => input)
  .handler(async ({ data }) => {
    const store = await readStore()
    const id = randomUUID().slice(0, 8)
    const shareId = `${createIdeaShareSlug(data.payload.idea)}-${id}`
    const record: SharedIdeaRecord = {
      id,
      shareId,
      payload: data.payload,
      createdAt: new Date().toISOString(),
    }

    store.items.unshift(record)
    await writeStore({ items: store.items.slice(0, 500) })

    return {
      shareId,
      payload: record.payload,
    }
  })

export const getSharedIdeaLink = createServerFn({ method: "GET" })
  .inputValidator((input: { shareId: string }) => input)
  .handler(async ({ data }) => {
    const store = await readStore()
    const record = store.items.find((item) => item.shareId === data.shareId)

    return record
      ? {
          shareId: record.shareId,
          payload: record.payload,
        }
      : null
  })
