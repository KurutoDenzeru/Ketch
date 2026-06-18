"use client"

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import {
  Bookmark,
  ChevronRight,
  Eye,
  Globe,
  Search,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import type { IdeaCategory, SavedIdea, ShareableIdeaPayload } from "@/types/idea"
import { EmptyState } from "@/components/empty-state"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategoryIcon } from "@/lib/category-icons"
import {
  buildSharedIdeaUrl,
  getRecentSharedIdeas,
  getSavedIdeas,
  removeIdea,
  removeRecentSharedIdea,
} from "@/lib/idea-storage"
import { getSharedLinks, removeSharedLink } from "@/lib/shared-links"
import { recordActivity } from "@/lib/activity-log"
import { exportIdeasAsJson, exportIdeasAsMarkdown, exportIdeasAsText } from "@/lib/data-export"
import { buildSeoHead } from "@/lib/seo"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/app/library")({
  head: () =>
    buildSeoHead({
      path: "/app/library",
      title: "Library | Ketch",
      description: "Revisit saved startup ideas, share links, and recently viewed snapshots.",
      keywords: "saved startup ideas, Ketch library, share links",
      imageAlt: "Ketch Library",
      robots: "noindex, follow",
    }),
  component: LibraryPage,
})

type LibraryTab = "saved" | "shared" | "recent"

type LibraryItem = {
  id: string
  name: string
  tagline: string
  category: IdeaCategory
  validationScore: number
  createdAt: string
  kind: LibraryTab
  source: "saved" | "shared-link" | "recent-view"
  payload: ShareableIdeaPayload
  shareId?: string
  views?: number
}

type Snapshot = {
  saved: Array<SavedIdea>
  shared: ReturnType<typeof getSharedLinks>
  recent: ReturnType<typeof getRecentSharedIdeas>
}

const EMPTY_SNAPSHOT: Snapshot = { saved: [], shared: [], recent: [] }

function readSnapshot(): Snapshot {
  return {
    saved: getSavedIdeas(),
    shared: getSharedLinks(),
    recent: getRecentSharedIdeas(),
  }
}

function LibraryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<LibraryTab>("saved")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"newest" | "oldest" | "score" | "name">("newest")
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSnapshot(readSnapshot())
    setHydrated(true)
  }, [])

  const items = useMemo(() => {
    const savedItems: Array<LibraryItem> = snapshot.saved.map((idea) => ({
      id: idea.id,
      name: idea.idea.name,
      tagline: idea.idea.tagline,
      category: idea.idea.category,
      validationScore: idea.idea.validationScore,
      createdAt: idea.createdAt,
      kind: "saved",
      source: "saved",
      payload: { idea: idea.idea, pitch: idea.pitch, marketValidation: idea.marketValidation },
    }))
    const sharedItems: Array<LibraryItem> = snapshot.shared.map((link) => ({
      id: link.shareId,
      name: link.payload.idea.name,
      tagline: link.payload.idea.tagline,
      category: link.payload.idea.category,
      validationScore: link.payload.idea.validationScore,
      createdAt: link.createdAt,
      kind: "shared",
      source: "shared-link",
      payload: link.payload,
      shareId: link.shareId,
      views: link.views,
    }))
    const recentItems: Array<LibraryItem> = snapshot.recent.map((recent) => ({
      id: recent.shareId,
      name: recent.payload.idea.name,
      tagline: recent.payload.idea.tagline,
      category: recent.payload.idea.category,
      validationScore: recent.payload.idea.validationScore,
      createdAt: recent.viewedAt,
      kind: "recent",
      source: "recent-view",
      payload: recent.payload,
      shareId: recent.shareId,
    }))
    return { saved: savedItems, shared: sharedItems, recent: recentItems }
  }, [snapshot])

  const current = items[tab]
  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    const base = lower
      ? current.filter((item) =>
          [item.name, item.tagline, item.category]
            .join(" ")
            .toLowerCase()
            .includes(lower)
        )
      : current
    const sorted = [...base].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "score":
          return b.validationScore - a.validationScore
        case "name":
          return a.name.localeCompare(b.name)
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    return sorted
  }, [current, query, sort])

  function handleSelect(item: LibraryItem) {
    if (item.source === "saved") {
      navigate({ to: "/app/library/$id", params: { id: item.id } })
      return
    }
    if (item.shareId) {
      window.location.assign(buildSharedIdeaUrl(item.shareId))
      return
    }
    navigate({ to: "/app/library/$id", params: { id: item.id } })
  }

  function handleDelete(item: LibraryItem) {
    if (item.source === "saved") {
      const next = removeIdea(item.id)
      setSnapshot({ ...snapshot, saved: next })
      recordActivity("idea_removed", { idea: item.payload.idea, ideaId: item.id })
      toast.success("Saved idea removed", {
        description: "The local copy has been deleted from this browser.",
      })
      return
    }
    if (item.source === "shared-link") {
      removeSharedLink(item.id)
      setSnapshot({ ...snapshot, shared: snapshot.shared.filter((s) => s.shareId !== item.id) })
      toast.success("Share link removed", {
        description: "The link won't appear in this device's library anymore.",
      })
      return
    }
    removeRecentSharedIdea(item.id)
    setSnapshot({ ...snapshot, recent: snapshot.recent.filter((s) => s.shareId !== item.id) })
  }

  function handleExport(format: "json" | "markdown" | "text") {
    if (items.saved.length === 0) {
      toast.error("Nothing to export", {
        description: "Save at least one idea before exporting.",
      })
      return
    }
    const payload = items.saved.map((item) => {
      const found = snapshot.saved.find((saved) => saved.id === item.id)
      if (found) return found
      return { ...item.payload, id: item.id, createdAt: item.createdAt } as SavedIdea
    })
    const text =
      format === "json"
        ? exportIdeasAsJson(payload)
        : format === "markdown"
          ? exportIdeasAsMarkdown(payload)
          : exportIdeasAsText(payload)
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `ketch-library.${format === "json" ? "json" : "md"}`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Library exported", {
      description: `${payload.length} ${payload.length === 1 ? "idea" : "ideas"} downloaded.`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-6">
        <SectionHeader
          eyebrow="Library"
          title={
            <>
              Every idea you've
              <span className="italic text-primary"> kept nearby.</span>
            </>
          }
          description="Saved concepts, share links you've created, and shared ideas you've opened — all in one place."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as LibraryTab)}
            className="gap-0"
          >
            <TabsList className="h-auto rounded-full border border-border/60 bg-card/80 p-1 shadow-card">
              <TabTrigger value="saved" icon={Bookmark} label="Saved" count={items.saved.length} />
              <TabTrigger value="shared" icon={Share2} label="Shared by me" count={items.shared.length} />
              <TabTrigger value="recent" icon={Eye} label="Recently viewed" count={items.recent.length} />
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => handleExport("json")}
            >
              Export JSON
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => handleExport("markdown")}
            >
              Export Markdown
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Filter ${tabLabel(tab)} ideas…`}
              className="h-10 rounded-full pl-9"
              aria-label={`Filter ${tabLabel(tab)} ideas`}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear filter"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Sort
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-9 rounded-full border border-border/60 bg-background/80 px-3 text-sm"
              aria-label="Sort"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="score">Score</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </header>

      {!hydrated ? (
        <LibrarySkeleton />
      ) : filtered.length === 0 ? (
        <LibraryEmpty
          tab={tab}
          onCreate={() => navigate({ to: "/app/new" })}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <RevealOnScroll key={`${item.source}-${item.id}`}>
              <LibraryRow
                item={item}
                onOpen={() => handleSelect(item)}
                onDelete={() => handleDelete(item)}
              />
            </RevealOnScroll>
          ))}
        </div>
      )}
    </div>
  )
}

function tabLabel(tab: LibraryTab) {
  if (tab === "saved") return "saved"
  if (tab === "shared") return "shared"
  return "recent"
}

type TabTriggerProps = {
  value: LibraryTab
  icon: typeof Bookmark
  label: string
  count: number
}

function TabTrigger({ value, icon: Icon, label, count }: TabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium data-active:bg-primary data-active:text-primary-foreground"
    >
      <Icon className="size-4" />
      {label}
      <span className="rounded-full bg-background/40 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
        {count}
      </span>
    </TabsTrigger>
  )
}

type LibraryRowProps = {
  item: LibraryItem
  onOpen: () => void
  onDelete: () => void
}

function LibraryRow({ item, onOpen, onDelete }: LibraryRowProps) {
  const Icon = getCategoryIcon(item.category)
  return (
    <Card className="group rounded-2xl border border-border/60 bg-card/80 py-0 shadow-card transition-shadow hover:shadow-elevated">
      <CardContent className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <button
          type="button"
          onClick={onOpen}
          className="flex flex-1 items-center gap-4 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg leading-tight">
                {item.name}
              </h3>
              <ScoreChip score={item.validationScore} />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {item.category}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-muted-foreground">
              {item.tagline}
            </p>
            <p
              className="mt-2 text-[11px] tracking-[0.16em] text-muted-foreground uppercase"
              suppressHydrationWarning
            >
              {item.source === "saved" ? "Saved" : item.source === "shared-link" ? "Shared link" : "Viewed"}{" "}
              · {new Date(item.createdAt).toLocaleString()}
              {item.source === "shared-link" && typeof item.views === "number"
                ? ` · ${item.views} view${item.views === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open"
            onClick={onOpen}
            className="rounded-full"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove"
            onClick={onDelete}
            className="rounded-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreChip({ score }: { score: number }) {
  const tone =
    score >= 7
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
      : score >= 5
        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold tabular-nums",
        tone
      )}
    >
      <Star className="size-3" />
      {score}/10
    </span>
  )
}

function LibraryEmpty({ tab, onCreate }: { tab: LibraryTab; onCreate: () => void }) {
  if (tab === "saved") {
    return (
      <EmptyState
        icon={<Bookmark className="size-10" />}
        title="No saved ideas yet"
        description="Save an idea from the lab when it feels worth keeping. Saved ideas stay in this browser and never leave your device unless you share them."
        action={
          <Button asChild className="rounded-full">
            <Link to="/app/new">Open the lab</Link>
          </Button>
        }
      />
    )
  }
  if (tab === "shared") {
    return (
      <EmptyState
        icon={<Share2 className="size-10" />}
        title="No share links yet"
        description="Click Share on any idea to publish a public URL. The links you create on this device will show up here for quick re-sharing."
        action={
          <Button onClick={onCreate} className="rounded-full">
            Open the lab
          </Button>
        }
      />
    )
  }
  return (
    <EmptyState
      icon={<Globe className="size-10" />}
      title="No recently viewed ideas"
      description="Open a shared idea link and it'll appear here. The Library keeps a private log of every shared idea you've viewed in this browser."
      action={
        <Button onClick={onCreate} variant="outline" className="rounded-full">
          Back to the lab
        </Button>
      }
    />
  )
}

function LibrarySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-border/60 bg-card/80 py-0 shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <Skeleton className="size-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
