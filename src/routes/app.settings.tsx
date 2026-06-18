"use client"

import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Database,
  Download,
  Eye,
  Package,
  Share2,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react"
import { toast } from "sonner"

import { useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import type { SavedIdea } from "@/types/idea"
import { EmptyState } from "@/components/empty-state"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getGenerationRateLimitStatus } from "@/lib/gemini"
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
  parseImport,
} from "@/lib/data-export"
import { buildSeoHead } from "@/lib/seo"
import { brand } from "@/lib/brand"
import { cn } from "@/lib/utils"

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

type SectionId = "generation" | "data" | "sharing" | "about"

const sections: Array<{ id: SectionId; label: string; description: string; icon: LucideIcon }> = [
  {
    id: "generation",
    label: "Generation",
    description: "Quota, model info, and defaults.",
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
  {
    id: "about",
    label: "About",
    description: "Version and credits.",
    icon: Package,
  },
]

function SettingsPage() {
  const [section, setSection] = useState<SectionId>("generation")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <SectionHeader
        eyebrow="Settings"
        title={
          <>
            Make Ketch
            <span className="italic text-primary"> feel like home.</span>
          </>
        }
        description="Generation quota, data controls, and share-link history. The theme toggle lives in the footer."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Settings" className="space-y-1">
            {sections.map(({ id, label, description, icon: Icon }) => {
              const active = section === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground shadow-xs"
                      : "border-transparent text-foreground/75 hover:border-border/60 hover:bg-muted/40"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background text-foreground/65"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block truncate text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                      {description}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="space-y-4">
          {section === "generation" ? <GenerationSection /> : null}
          {section === "data" ? <DataSection /> : null}
          {section === "sharing" ? <SharingSection /> : null}
          {section === "about" ? <AboutSection /> : null}
        </section>
      </div>
    </div>
  )
}

function GenerationSection() {
  const generationRateLimitQuery = useQuery({
    queryKey: ["generation-rate-limit"],
    queryFn: () => getGenerationRateLimitStatus(),
  })
  const rateLimit = generationRateLimitQuery.data ?? null

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-6 p-6 md:p-7">
        <div>
          <SectionEyebrow icon={WandSparkles}>Generation</SectionEyebrow>
          <h3 className="mt-2 font-display text-2xl leading-tight">Quota & model</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generation is rate-limited per week to keep the lab fair for everyone.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Used" value={rateLimit ? rateLimit.used : "—"} />
          <Stat label="Remaining" value={rateLimit ? rateLimit.remaining : "—"} />
          <Stat label="Weekly cap" value={rateLimit ? rateLimit.limit : "—"} />
        </div>

        {rateLimit ? (
          <div className="space-y-2">
            <Progress
              value={(rateLimit.remaining / rateLimit.limit) * 100}
              className="h-2"
            />
            <p
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {rateLimit.isExhausted
                ? `Cooldown active — resets ${new Date(rateLimit.resetsAt ?? "").toLocaleString()}.`
                : `Resets ${new Date(rateLimit.resetsAt ?? "").toLocaleString()}.`}
            </p>
          </div>
        ) : (
          <Skeleton className="h-4 w-1/2" />
        )}

        <Separator />

        <div>
          <h4 className="font-medium">Model</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Idea framing, scoring, market validation, and pitch generation all
            run on Google Gemini. Model is selected automatically based on
            latency vs. quality.
          </p>
        </div>

        <div>
          <h4 className="font-medium">Default category</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Ketch remembers your last-used category. Pick one to pre-set on
            next visit (no account needed).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                "AI Tool",
                "SaaS",
                "Dev Tool",
                "Mobile App",
                "Marketplace",
                "Fintech",
                "Healthcare",
                "Creator Tool",
              ] as const
            ).map((category) => (
              <span
                key={category}
                className="inline-flex h-9 items-center rounded-full border border-border/60 bg-background/70 px-3.5 text-sm font-medium text-foreground/80"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DataSection() {
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState<Array<SavedIdea>>([])

  useEffect(() => {
    setSaved(getSavedIdeas())
    setHydrated(true)
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
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-6 p-6 md:p-7">
        <div>
          <SectionEyebrow icon={Database}>Data</SectionEyebrow>
          <h3 className="mt-2 font-display text-2xl leading-tight">Your library</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything lives in this browser. Export to move data to another device.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Saved ideas" value={saved.length} />
          <Stat label="Local size" value={`${kb} KB`} />
          <Stat label="Last export" value="—" />
        </div>

        <Separator />

        <div>
          <h4 className="font-medium">Export</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            JSON for full restore, Markdown for documentation, plain text for clipboard.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </div>

        <div>
          <h4 className="font-medium">Import</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Restoring from a previous JSON export. Duplicates are merged.
          </p>
          <Label
            htmlFor="import-file"
            className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 text-sm font-medium hover:bg-muted/60"
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

        <Separator />

        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div className="flex-1">
              <h4 className="font-medium">Clear local library</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Removes every saved idea, draft, and share-link history from this
                device. Public share links keep working.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-3 rounded-full"
                onClick={handleClear}
                disabled={!hydrated || saved.length === 0}
              >
                <Trash2 className="size-4" />
                Clear library
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-4">
      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
        <CardContent className="space-y-4 p-6 md:p-7">
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
        <CardContent className="space-y-4 p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionEyebrow icon={Eye}>Recent views</SectionEyebrow>
              <h3 className="mt-2 font-display text-2xl leading-tight">
                Recently opened shared ideas
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A private log of shared ideas you've opened in this browser.
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
        </CardContent>
      </Card>
    </div>
  )
}

function AboutSection() {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-5 p-6 md:p-7">
        <div>
          <SectionEyebrow icon={Package}>About</SectionEyebrow>
          <h3 className="mt-2 font-display text-2xl leading-tight">{brand.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A founder-first AI workshop. Local-first, open source, MIT licensed.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Version" value="0.2.0" />
          <Stat label="License" value="MIT" />
        </div>

        <Separator />

        <ul className="space-y-2 text-sm">
          <li>
            <a
              href={brand.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
            >
              GitHub repository <ChevronRight className="size-3.5" />
            </a>
          </li>
          <li>
            <a
              href={brand.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
            >
              LinkedIn <ChevronRight className="size-3.5" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/KurutoDenzeru/Ketch/blob/main/Contributing.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
            >
              Contributing <ChevronRight className="size-3.5" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/KurutoDenzeru/Ketch/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
            >
              License <ChevronRight className="size-3.5" />
            </a>
          </li>
        </ul>

        <Separator />

        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
          <p className="inline-flex items-center gap-2 font-medium text-foreground/85">
            <Check className="size-4 text-primary" />
            Built for solo founders
          </p>
          <p className="mt-2">
            {brand.name} keeps your briefs, saved ideas, and draft memo on this
            device. Share links are published when you choose to.
          </p>
        </div>
      </CardContent>
    </Card>
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
