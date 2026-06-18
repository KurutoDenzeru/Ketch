"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  Activity,
  ArrowRight,
  Bookmark,
  Compass,
  Eye,
  Gauge,
  PieChart,
  Share2,
  Sparkles,
  Star,
  Trash2,
  WandSparkles,
} from "lucide-react"
import type {
  BarChart3} from "lucide-react";

import type { IdeaCategory } from "@/types/idea"
import type {ActivityEvent} from "@/lib/activity-log";
import { EmptyState } from "@/components/empty-state"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionHeader } from "@/components/section-header"
import { ScoreRing } from "@/components/score-ring"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getSavedIdeas } from "@/lib/idea-storage"
import { getSharedLinks } from "@/lib/shared-links"
import {  getActivityLog } from "@/lib/activity-log"
import { getGenerationRateLimitStatus } from "@/lib/gemini"
import { buildSeoHead } from "@/lib/seo"
import { getCategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/app/dashboard")({
  head: () =>
    buildSeoHead({
      path: "/app/dashboard",
      title: "Dashboard | Ketch",
      description: "Ketch activity overview: saved ideas, share links, and weekly generation usage.",
      keywords: "Ketch dashboard, founder activity, idea lab overview",
      imageAlt: "Ketch dashboard",
      robots: "noindex, follow",
    }),
  component: DashboardPage,
})

const activityConfig: Record<
  ActivityEvent["kind"],
  { label: string; icon: typeof Activity; tone: string }
> = {
  idea_generated: {
    label: "Idea generated",
    icon: Sparkles,
    tone: "text-primary",
  },
  idea_saved: {
    label: "Idea saved",
    icon: Bookmark,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  idea_removed: {
    label: "Idea removed",
    icon: Trash2,
    tone: "text-rose-500",
  },
  link_shared: {
    label: "Share link created",
    icon: Share2,
    tone: "text-brand-blue",
  },
  link_viewed: {
    label: "Share link opened",
    icon: Eye,
    tone: "text-brand-gold",
  },
  brief_updated: {
    label: "Brief updated",
    icon: WandSparkles,
    tone: "text-muted-foreground",
  },
}

function DashboardPage() {
  const [hydrated, setHydrated] = useState(false)
  const [snapshot, setSnapshot] = useState({
    saved: [] as ReturnType<typeof getSavedIdeas>,
    shared: [] as ReturnType<typeof getSharedLinks>,
    activity: [] as Array<ActivityEvent>,
  })

  const generationRateLimitQuery = useQuery({
    queryKey: ["generation-rate-limit"],
    queryFn: () => getGenerationRateLimitStatus(),
  })
  const generationRateLimit = generationRateLimitQuery.data ?? null

  useEffect(() => {
    setSnapshot({
      saved: getSavedIdeas(),
      shared: getSharedLinks(),
      activity: getActivityLog(),
    })
    setHydrated(true)
  }, [])

  const stats = useMemo(() => {
    const savedCount = snapshot.saved.length
    const sharedCount = snapshot.shared.length
    const scores = snapshot.saved.map((item) => item.idea.validationScore)
    const averageScore =
      scores.length === 0
        ? 0
        : Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
    return { savedCount, sharedCount, averageScore }
  }, [snapshot])

  const categoryBreakdown = useMemo(() => {
    const counts: Partial<Record<IdeaCategory, number>> = {}
    snapshot.saved.forEach((idea) => {
      counts[idea.idea.category] = (counts[idea.idea.category] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([category, count]) => ({ category: category as IdeaCategory, count }))
      .sort((a, b) => b.count - a.count)
  }, [snapshot])

  const recentActivity = useMemo(() => snapshot.activity.slice(0, 10), [snapshot])

  if (!hydrated) {
    return <DashboardSkeleton />
  }

  if (snapshot.saved.length === 0 && snapshot.shared.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 md:px-6">
        <EmptyState
          icon={<Compass className="size-10" />}
          title="Welcome to the dashboard."
          description="Generate your first idea to see the lab come to life. Saved ideas, share links, and weekly generation usage all show up here."
          action={
            <Button asChild className="rounded-full">
              <Link to="/app/new">
                <WandSparkles className="size-4" />
                Open the lab
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <SectionHeader
        eyebrow="Dashboard"
        title={
          <>
            Your lab at a
            <span className="italic text-primary"> glance.</span>
          </>
        }
        description="Saved ideas, share links, and weekly generation usage — all in one place."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Saved ideas"
          value={stats.savedCount}
          icon={Bookmark}
          detail="In your local library"
        />
        <KpiCard
          label="Share links"
          value={stats.sharedCount}
          icon={Share2}
          detail="Published from this device"
        />
        <KpiCard
          label="Average score"
          value={stats.averageScore ? `${stats.averageScore}/10` : "—"}
          icon={Star}
          detail="Across saved ideas"
        />
        <KpiCard
          label="Generations used"
          value={
            generationRateLimit
              ? `${generationRateLimit.limit - generationRateLimit.remaining}/${generationRateLimit.limit}`
              : "—"
          }
          icon={Gauge}
          detail="This week"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <RevealOnScroll>
          <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
            <CardContent className="space-y-5 p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionEyebrow icon={Activity}>Recent activity</SectionEyebrow>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/app/library">
                    Open library <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Your activity log is empty. Generate, save, or share an idea
                  and you'll see a timeline here.
                </p>
              ) : (
                <ol className="relative space-y-4 pl-6">
                  <span
                    className="absolute top-1 bottom-1 left-2 w-px bg-border"
                    aria-hidden="true"
                  />
                  {recentActivity.map((event) => {
                    const config = activityConfig[event.kind]
                    const Icon = config.icon
                    return (
                      <li
                        key={event.id}
                        className="relative flex items-start gap-3"
                      >
                        <span
                          className={cn(
                            "absolute -left-6 top-0.5 inline-flex size-5 items-center justify-center rounded-full border border-border/60 bg-background",
                            config.tone
                          )}
                        >
                          <Icon className="size-3" />
                        </span>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              {config.label}
                            </span>{" "}
                            {event.ideaName ? (
                              <span className="text-muted-foreground">
                                · {event.ideaName}
                              </span>
                            ) : null}
                          </p>
                          <p
                            className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase"
                            suppressHydrationWarning
                          >
                            {new Date(event.at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
            <CardContent className="space-y-5 p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionEyebrow icon={Gauge}>Generation quota</SectionEyebrow>
              </div>
              {generationRateLimit ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <ScoreRing
                      value={generationRateLimit.remaining}
                      max={generationRateLimit.limit}
                      size={104}
                      strokeWidth={9}
                      tone={generationRateLimit.isExhausted ? "warning" : "primary"}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {generationRateLimit.isExhausted
                          ? "Weekly cooldown active"
                          : `${generationRateLimit.remaining} credits left`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {generationRateLimit.used} of {generationRateLimit.limit} used
                        {generationRateLimit.resetsAt
                          ? ` · resets ${new Date(generationRateLimit.resetsAt).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(generationRateLimit.remaining / generationRateLimit.limit) * 100}
                    className="h-2"
                  />
                </div>
              ) : (
                <Skeleton className="h-20 w-full rounded-2xl" />
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/app/new">
                    <WandSparkles className="size-4" />
                    New idea
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/app/library">
                    <Library />
                    Open library
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
          <CardContent className="space-y-5 p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionEyebrow icon={PieChart}>Top categories</SectionEyebrow>
              <p className="text-xs text-muted-foreground">
                Based on your saved ideas
              </p>
            </div>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Save a few ideas and your category mix will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.slice(0, 6).map(({ category, count }) => {
                  const Icon = getCategoryIcon(category)
                  const total = categoryBreakdown.reduce(
                    (sum, item) => sum + item.count,
                    0
                  )
                  const ratio = total === 0 ? 0 : Math.round((count / total) * 100)
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <Icon className="size-4 text-primary" />
                          {category}
                        </span>
                        <span className="text-muted-foreground">
                          {count} {count === 1 ? "idea" : "ideas"} · {ratio}%
                        </span>
                      </div>
                      <Progress value={ratio} className="h-2" />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </RevealOnScroll>
    </div>
  )
}

function Library() {
  return <Bookmark className="size-4" />
}

type KpiCardProps = {
  label: string
  value: number | string
  icon: typeof BarChart3
  detail: string
}

function KpiCard({ label, value, icon: Icon, detail }: KpiCardProps) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
      <CardContent className="space-y-3 p-5">
        <div className="inline-flex size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-1 font-display text-3xl leading-none tabular-nums">
            {value}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  )
}
