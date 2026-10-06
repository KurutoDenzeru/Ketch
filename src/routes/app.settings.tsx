"use client"

import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  ChevronRight,
  Database,
  Download,
  Eye,
  Share2,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react"
import { toast } from "sonner"

import { useQuery } from "@tanstack/react-query"
import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import type { SavedIdea } from "@/types/idea"
import { AppCard, AppMasthead, AppPage } from "@/components/app/app-chrome"
import { EmptyState } from "@/components/empty-state"
import { Faq } from "@/components/faq"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getGenerationRateLimitStatus } from "@/lib/gemini"
import { getActivityLog } from "@/lib/activity-log"
import {
  clearRecentSharedIdeas,
  getRecentSharedIdeas,
  getSavedIdeas,
  isIdeaSaved,
  removeIdea,
  removeRecentSharedIdea,
  saveIdea,
  updateSavedIdea,
} from "@/lib/idea-storage"
import { clearSharedLinks, getSharedLinks, removeSharedLink } from "@/lib/shared-links"
import {
  estimateStorageBytes,
  exportIdeasAsJson,
  exportIdeasAsMarkdown,
  exportIdeasAsText,
  getLastExportTimestamp,
  parseImport,
  recordExportTimestamp,
} from "@/lib/data-export"
import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/app/settings")({
  head: () =>
    buildSeoHead({
      path: "/app/settings",
      title: "Settings | Ketch",
      description: "Generation quota, data controls, and share-link history for Ketch.",
      keywords: "Ketch settings, data export, share links",
      imageAlt: "Ketch settings",
      robots: "noindex, follow",
    }),
  component: SettingsPage,
})

type SectionId = "generation" | "data" | "sharing"

const sections: Array<{ id: SectionId; label: string; description: string; icon: LucideIcon }> = [
  {
    id: "generation",
    label: "Generation",
    description: "Quota and usage history.",
    icon: WandSparkles,
  },
  {
    id: "data",
    label: "Data",
    description: "Storage, export, and import.",
    icon: Database,
  },
  {
    id: "sharing",
    label: "Sharing",
    description: "Share links on this device.",
    icon: Share2,
  },
]

function SettingsPage() {
  const [section, setSection] = useState<SectionId>("generation")

  return (
    <AppPage>
      <AppMasthead
        eyebrow="Settings"
        title="Make Ketch"
        accent="feel like home."
        description="Generation quota, data controls, and share-link history. The theme toggle lives in the footer."
        art="draft"
      />

      <div className="mt-8 grid gap-6 md:mt-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <ScrollReveal>
            <nav
              aria-label="Settings"
              className="flex gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-card/70 p-2 shadow-sm backdrop-blur lg:flex-col lg:gap-1 lg:overflow-visible"
            >
              {sections.map(({ id, label, description, icon: Icon }) => {
                const active = section === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={cn(
                      "group flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-500 ease-out lg:shrink",
                      active
                        ? "bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "text-foreground/75 hover:bg-muted/50"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/60 bg-background text-foreground/65 group-hover:border-foreground/20"
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 lg:min-w-0">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="hidden text-[11px] tracking-[0.16em] text-muted-foreground uppercase lg:block">
                        {description}
                      </span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-500 ease-out",
                        active
                          ? "translate-x-0.5 text-primary"
                          : "text-muted-foreground group-hover:translate-x-0.5"
                      )}
                    />
                  </button>
                )
              })}
            </nav>
          </ScrollReveal>
        </aside>

        <section>
          {section === "generation" ? <GenerationSection /> : null}
          {section === "data" ? <DataSection /> : null}
          {section === "sharing" ? <SharingSection /> : null}
        </section>
      </div>

      <div className="mt-16 md:mt-20">
        <Faq />
      </div>
    </AppPage>
  )
}

function GenerationSection() {
  const generationRateLimitQuery = useQuery({
    queryKey: ["generation-rate-limit"],
    queryFn: () => getGenerationRateLimitStatus(),
  })
  const rateLimit = generationRateLimitQuery.data ?? null

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem className="h-full">
        <AppCard className="h-full space-y-6">
          <div>
            <SectionEyebrow icon={WandSparkles}>Generation</SectionEyebrow>
            <h2 className="mt-2 font-display text-3xl leading-tight text-balance">
              Weekly quota
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
              Generation is rate-limited per week to keep the lab fair for
              everyone. The window resets on a fixed schedule, so the counters
              below are the same ones the lab reads before it runs a model.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-flow-dense">
            <StaggerItem className="h-full">
              <Stat label="Used" value={rateLimit ? rateLimit.used : "—"} />
            </StaggerItem>
            <StaggerItem className="h-full">
              <Stat label="Remaining" value={rateLimit ? rateLimit.remaining : "—"} />
            </StaggerItem>
            <StaggerItem className="h-full">
              <Stat label="Weekly cap" value={rateLimit ? rateLimit.limit : "—"} />
            </StaggerItem>
          </div>

          {rateLimit ? (
            <div className="space-y-2">
              <Progress
                value={(rateLimit.remaining / rateLimit.limit) * 100}
                className="h-2"
              />
              <p
                className="text-xs text-muted-foreground tabular-nums"
                suppressHydrationWarning
              >
                {rateLimit.resetsAt
                  ? rateLimit.isExhausted
                    ? `Cooldown active, resets ${new Date(rateLimit.resetsAt).toLocaleString()}.`
                    : `Resets ${new Date(rateLimit.resetsAt).toLocaleString()}.`
                  : "No active cooldown."}
              </p>
            </div>
          ) : (
            <Skeleton className="h-4 w-1/2" />
          )}
        </AppCard>
      </StaggerItem>

      <StaggerItem className="h-full">
        <AppCard className="h-full space-y-4">
          <div>
            <SectionEyebrow icon={WandSparkles}>Usage activity</SectionEyebrow>
            <h2 className="mt-2 font-display text-3xl leading-tight text-balance">
              A year of your lab
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
              Every event Ketch recorded in this browser over the past year.
              Ideas generated, saved, removed, and shared.
            </p>
          </div>
          <ContributionGraph />
        </AppCard>
      </StaggerItem>
    </StaggerGroup>
  )
}

function ContributionGraph() {
  const [hydrated, setHydrated] = useState(false)
  const [grid, setGrid] = useState<Array<Array<number>>>([])
  const [monthLabels, setMonthLabels] = useState<Array<{ label: string; col: number }>>([])

  useEffect(() => {
    const log = getActivityLog()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const start = new Date(today)
    start.setDate(start.getDate() - 52 * 7 - start.getDay() + 1)
    if (start.getDay() !== 1) start.setDate(start.getDate() + 1)

    const counts: Record<string, number> = {}
    for (const event of log) {
      const d = new Date(event.at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      counts[key] = (counts[key] ?? 0) + 1
    }

    const totalDays = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
    const totalWeeks = Math.ceil(totalDays / 7)

    const g: Array<Array<number>> = []
    const months: Array<{ label: string; col: number }> = []
    let lastMonth = -1

    for (let w = 0; w < totalWeeks; w++) {
      const week: Array<number> = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(start)
        day.setDate(day.getDate() + w * 7 + d)
        if (day > today) {
          week.push(-1)
        } else {
          const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
          week.push(counts[key] ?? 0)
          const m = day.getMonth()
          if (m !== lastMonth) {
            months.push({
              label: day.toLocaleString("default", { month: "short" }),
              col: w,
            })
            lastMonth = m
          }
        }
      }
      g.push(week)
    }

    setGrid(g)
    setMonthLabels(months)
    setHydrated(true)
  }, [])

  if (!hydrated || grid.length === 0) {
    return <Skeleton className="h-[140px] w-full" />
  }

  const colW = 14
  const dayColW = 32
  const totalW = dayColW + grid.length * colW
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]

  return (
    <div className="overflow-x-auto">
      <div style={{ width: totalW }} className="select-none">
        {/* Month labels */}
        <div className="relative mb-1" style={{ height: 14, paddingLeft: dayColW }}>
          {monthLabels.map((m, i) => (
            <span
              key={`${m.label}-${i}`}
              className="absolute top-0 text-[10px] leading-none text-muted-foreground"
              style={{ left: dayColW + m.col * colW }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex items-start gap-[3px]">
          {/* Day-of-week labels */}
          <div className="flex w-8 shrink-0 flex-col gap-[3px] pt-[3px]">
            {dayLabels.map((label, i) => (
              <span key={i} className="flex h-[11px] items-center text-[9px] leading-none text-muted-foreground">
                {label}
              </span>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((week, w) => (
            <div key={w} className="flex shrink-0 flex-col gap-[3px]">
              {week.map((count, d) =>
                count === -1 ? (
                  <span key={d} className="h-[11px] w-[11px]" />
                ) : (
                  <span
                    key={d}
                    className={`h-[11px] w-[11px] rounded-[2px] ${
                      count === 0
                        ? "bg-muted/50"
                        : count === 1
                          ? "bg-primary/20"
                          : count === 2
                            ? "bg-primary/40"
                            : count === 3
                              ? "bg-primary/65"
                              : "bg-primary"
                    }`}
                    title={`${count} event${count === 1 ? "" : "s"}`}
                  />
                )
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-[11px] w-[11px] rounded-[2px] ${
                n === 0
                  ? "bg-muted/50"
                  : n === 1
                    ? "bg-primary/20"
                    : n === 2
                      ? "bg-primary/40"
                      : n === 3
                        ? "bg-primary/65"
                        : "bg-primary"
              }`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

function DataSection() {
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState<Array<SavedIdea>>([])
  const [lastExportAt, setLastExportAt] = useState<string | null>(null)

  useEffect(() => {
    setSaved(getSavedIdeas())
    setHydrated(true)
    setLastExportAt(getLastExportTimestamp())
  }, [])

  const storageBytes = useMemo(() => estimateStorageBytes(saved), [saved])
  const kb = (storageBytes / 1024).toFixed(1)

  function handleExport(format: "json" | "markdown" | "text") {
    if (saved.length === 0) {
      toast.error("Nothing to export", {
        description: "Save an idea first.",
      })
      return
    }
    const text =
      format === "json"
        ? exportIdeasAsJson(saved)
        : format === "markdown"
          ? exportIdeasAsMarkdown(saved)
          : exportIdeasAsText(saved)
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `ketch-ideas.${format === "json" ? "json" : "md"}`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Exported", { description: `${saved.length} ideas downloaded.` })
    recordExportTimestamp()
    setLastExportAt(new Date().toISOString())
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : ""
      const result = parseImport(raw)
      if (!result.ok) {
        toast.error("Import failed", { description: result.error })
        return
      }
      let imported = 0
      result.ideas.forEach((idea) => {
        if (!isIdeaSaved(idea.idea)) {
          saveIdea({ idea: idea.idea, pitch: idea.pitch, marketValidation: idea.marketValidation })
          imported += 1
        } else {
          updateSavedIdea(idea.id, idea)
          imported += 1
        }
      })
      setSaved(getSavedIdeas())
      toast.success("Import complete", {
        description: `${imported} ${imported === 1 ? "idea" : "ideas"} added to your library.`,
      })
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  function handleClear() {
    if (saved.length === 0) return
    if (!window.confirm(`Remove all ${saved.length} saved ideas? This can't be undone.`)) {
      return
    }
    saved.forEach((idea) => removeIdea(idea.id))
    setSaved([])
    toast.success("All saved ideas removed", {
      description: "Your library is empty.",
    })
  }

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem className="h-full">
        <AppCard className="h-full space-y-6">
          <div>
            <SectionEyebrow icon={Database}>Data</SectionEyebrow>
            <h2 className="mt-2 font-display text-3xl leading-tight text-balance">
              Your library
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
              Everything lives in this browser. Export to move data to another
              device.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-flow-dense">
            <StaggerItem className="h-full">
              <Stat label="Saved ideas" value={saved.length} />
            </StaggerItem>
            <StaggerItem className="h-full">
              <Stat label="Local size" value={`${kb} KB`} />
            </StaggerItem>
            <StaggerItem className="h-full">
              <Stat
                label="Last export"
                value={
                  hydrated && lastExportAt
                    ? new Date(lastExportAt).toLocaleDateString()
                    : "—"
                }
              />
            </StaggerItem>
          </div>
        </AppCard>
      </StaggerItem>

      <StaggerGroup className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 md:grid-flow-dense">
        <StaggerItem className="h-full">
          <AppCard className="flex h-full flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-primary" aria-hidden="true" />
              <h3 className="font-display text-xl leading-tight">Export</h3>
            </div>
            <p className="text-sm leading-6 text-pretty text-muted-foreground">
              Each export contains every saved idea with its name, tagline, full
              pitch, market validation, and the timestamp it was saved. JSON is
              the only format Import accepts, because it is the only one that
              round-trips every field without loss.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => handleExport("json")}
                disabled={!hydrated}
              >
                <Download className="size-4" />
                JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => handleExport("markdown")}
                disabled={!hydrated}
              >
                <Download className="size-4" />
                Markdown
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => handleExport("text")}
                disabled={!hydrated}
              >
                <Download className="size-4" />
                Plain text
              </Button>
            </div>
          </AppCard>
        </StaggerItem>

        <StaggerItem className="h-full">
          <AppCard className="flex h-full flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="size-4 text-primary" aria-hidden="true" />
              <h3 className="font-display text-xl leading-tight">Import</h3>
            </div>
            <p className="text-sm leading-6 text-pretty text-muted-foreground">
              Restoring from a previous Ketch JSON export. Duplicates are merged
              by fingerprint, so re-importing the same file never creates a
              second copy of an idea you already have.
            </p>
            <div className="mt-auto pt-2">
              <Label
                htmlFor="import-file"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                <Upload className="size-4" />
                Choose JSON file
                <Input
                  id="import-file"
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
              </Label>
            </div>
          </AppCard>
        </StaggerItem>
      </StaggerGroup>

      <StaggerItem className="h-full">
        <div className="h-full rounded-2xl border border-destructive/40 bg-destructive/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-xl leading-tight">
                Clear local library
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
                Removes every saved idea, draft, and share-link history from this
                device. Public share links keep working, because the idea itself
                is encoded in the URL rather than stored here. This cannot be
                undone.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-4 rounded-full"
                onClick={handleClear}
                disabled={!hydrated || saved.length === 0}
              >
                <Trash2 className="size-4" />
                Clear library
              </Button>
            </div>
          </div>
        </div>
      </StaggerItem>
    </StaggerGroup>
  )
}

function SharingSection() {
  const [hydrated, setHydrated] = useState(false)
  const [shared, setShared] = useState<ReturnType<typeof getSharedLinks>>([])
  type RecentEntry = ReturnType<typeof getRecentSharedIdeas>[number]
  const [recent, setRecent] = useState<Array<RecentEntry>>([])

  useEffect(() => {
    setShared(getSharedLinks())
    setRecent(getRecentSharedIdeas())
    setHydrated(true)
  }, [])

  function handleClearShared() {
    if (!window.confirm("Forget every share link created on this device? Public links stay valid.")) {
      return
    }
    clearSharedLinks()
    setShared([])
    toast.success("Share links cleared from this device")
  }

  function handleClearRecent() {
    clearRecentSharedIdeas()
    setRecent([])
    toast.success("Recent view history cleared")
  }

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem className="h-full">
        <AppCard className="h-full space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionEyebrow icon={Share2}>Shared by you</SectionEyebrow>
              <h3 className="mt-2 font-display text-2xl leading-tight">
                Share links on this device
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {hydrated ? `${shared.length} link${shared.length === 1 ? "" : "s"}` : "Loading…"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleClearShared}
              disabled={!hydrated || shared.length === 0}
            >
              <Trash2 className="size-4" />
              Clear list
            </Button>
          </div>
          {!hydrated ? (
            <Skeleton className="h-24 w-full" />
          ) : shared.length === 0 ? (
            <EmptyState
              variant="dashed"
              icon={<Share2 className="size-6" />}
              title="No share links yet"
              description="Use Share on any idea to publish a public URL. The links you create will appear here."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {shared.slice(0, 8).map((link) => (
                <li
                  key={link.shareId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {link.payload.idea.name}
                    </p>
                    <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      {link.payload.idea.category} ·{" "}
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Remove from this device"
                    onClick={() => {
                      removeSharedLink(link.shareId)
                      setShared(getSharedLinks())
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AppCard>
      </StaggerItem>

      <StaggerItem className="h-full">
        <AppCard className="h-full space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionEyebrow icon={Eye}>Recent views</SectionEyebrow>
              <h2 className="mt-2 font-display text-2xl leading-tight text-balance">
                Recently opened shared ideas
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
                A private log of shared ideas you have opened in this browser.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={handleClearRecent}
              disabled={!hydrated || recent.length === 0}
            >
              <Trash2 className="size-4" />
              Clear log
            </Button>
          </div>
          {!hydrated ? (
            <Skeleton className="h-24 w-full" />
          ) : recent.length === 0 ? (
            <EmptyState
              variant="dashed"
              icon={<Eye className="size-6" />}
              title="No recent shared ideas"
              description="Open a shared idea link and it'll show up here for quick re-opening."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.slice(0, 8).map((item) => (
                <li
                  key={item.shareId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.payload.idea.name}
                    </p>
                    <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      Opened{" "}
                      <span suppressHydrationWarning>
                        {new Date(item.viewedAt).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Forget"
                    onClick={() => {
                      removeRecentSharedIdea(item.shareId)
                      setRecent(getRecentSharedIdeas())
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AppCard>
      </StaggerItem>
    </StaggerGroup>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/85 p-4">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl leading-none tabular-nums">
        {value}
      </p>
    </div>
  )
}
