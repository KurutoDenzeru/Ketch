"use client"

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { cn } from "cn"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpDown,
  Bookmark,
  ChevronRight,
  Download,
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

import { AppMasthead, AppPage } from "@/components/app/app-chrome"
import { EmptyState } from "@/components/empty-state"
import { Faq } from "@/components/faq"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategoryIcon } from "@/lib/category-icons"
import {
  getRecentSharedIdeas,
  getSavedIdeas,
  removeIdea,
  removeRecentSharedIdea,
} from "@/lib/idea-storage"
import { getSharedLinks, removeSharedLink } from "@/lib/shared-links"
import { recordActivity } from "@/lib/activity-log"
import { exportIdeasAsJson, exportIdeasAsMarkdown, exportIdeasAsText } from "@/lib/data-export"
import { buildSeoHead } from "@/lib/seo"

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
      window.location.assign(item.shareId)
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
      return { ...item.payload, id: item.id, createdAt: item.createdAt }
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
    <AppPage>
      <AppMasthead
        eyebrow="Library"
        title="Every idea you have"
        accent="kept nearby."
        description="Saved concepts, share links you created, and shared ideas you opened. All of it stays in this browser until you export it."
        art="loop"
      />

      <div className="sticky top-20 z-20 mt-8 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-xl md:top-24 md:mt-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as LibraryTab)}
            className="gap-0"
          >
            <TabsList className="h-auto rounded-full border border-border/60 bg-card/80 p-1 shadow-xs">
              <TabTrigger value="saved" icon={Bookmark} label="Saved" count={items.saved.length} />
              <TabTrigger value="shared" icon={Share2} label="Shared by me" count={items.shared.length} />
              <TabTrigger value="recent" icon={Eye} label="Recently viewed" count={items.recent.length} />
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Filter ${tabLabel(tab)} ideas`}
                className="h-10 rounded-full bg-background/80 pl-9"
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

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as typeof sort)}
            >
              <SelectTrigger
                aria-label="Sort ideas"
                className="h-9 w-full rounded-full border-border/60 bg-background/80 text-sm sm:w-44"
              >
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="score">Highest score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-display text-sm text-foreground tabular-nums">
              {hydrated ? filtered.length : 0}
            </span>{" "}
            {hydrated
              ? tab === "shared"
                ? filtered.length === 1
                  ? "public link you created"
                  : "public links you created"
                : tab === "recent"
                  ? filtered.length === 1
                    ? "shared idea you opened"
                    : "shared ideas you opened"
                  : filtered.length === 1
                    ? "saved idea"
                    : "saved ideas"
              : "reading local storage"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => handleExport("json")}
            >
              <Download className="size-4" />
              Export JSON
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => handleExport("markdown")}
            >
              <Download className="size-4" />
              Export Markdown
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {!hydrated ? (
          <LibrarySkeleton />
        ) : filtered.length === 0 ? (
          <LibraryEmpty
            tab={tab}
            onCreate={() => navigate({ to: "/app/new" })}
          />
        ) : (
          <ScrollReveal>
          <StaggerGroup className="grid items-stretch gap-3 sm:grid-cols-2 md:grid-flow-dense lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <StaggerItem
                  key={`${item.source}-${item.id}`}
                  className="h-full"
                >
                  <LibraryRow
                    item={item}
                    onOpen={() => handleSelect(item)}
                    onDelete={() => handleDelete(item)}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </ScrollReveal>
        )}
      </div>

      <div className="mt-16 md:mt-20">
        <Faq />
      </div>
    </AppPage>
  )
}

function tabLabel(tab: LibraryTab) {
  if (tab === "saved") return "saved"
  if (tab === "shared") return "shared"
  return "recent"
}

const sourceLabel: Record<LibraryItem["source"], string> = {
  saved: "Saved locally",
  "shared-link": "Public link",
  "recent-view": "Opened",
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
      className="inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-primary transition-transform duration-700 ease-out group-hover:scale-105">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <ScoreChip score={item.validationScore} />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-lg leading-tight text-balance">
              {item.name}
            </h3>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {item.category}
            </span>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground text-pretty">
            {item.tagline}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p
            className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase"
            suppressHydrationWarning
          >
            {sourceLabel[item.source]} ·{" "}
            <span className="tabular-nums">
              {new Date(item.createdAt).toLocaleString()}
            </span>
            {item.source === "shared-link" && typeof item.views === "number"
              ? ` · ${item.views} view${item.views === 1 ? "" : "s"}`
              : ""}
          </p>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden="true"
          />
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-border/60 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="rounded-full"
        >
          {item.source === "saved" ? "Open idea" : "Open link"}
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
    </div>
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
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="size-11 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
