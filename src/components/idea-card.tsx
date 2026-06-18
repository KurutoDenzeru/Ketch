"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  Bookmark,
  Check,
  Clipboard,
  Compass,
  Copy,
  FileCode2,
  Globe,
  Lightbulb,
  LoaderCircle,
  
  RefreshCcw,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles
} from "lucide-react"
import { toast } from "sonner"
import type {LucideIcon} from "lucide-react";

import type { MarketValidation, StartupIdea, StartupPitch } from "@/types/idea"
import type { GenerationRateLimitStatus } from "@/types/rate-limit"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { PitchSection } from "@/components/pitch-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScoreRing } from "@/components/score-ring"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

type IdeaCardProps = {
  idea: StartupIdea
  pitch: StartupPitch | null
  marketValidation: MarketValidation | null
  headerActions?: React.ReactNode
  isPitchLoading: boolean
  isMarketValidationLoading: boolean
  isRegeneratingTitles?: boolean
  isSharing?: boolean
  isSaved?: boolean
  copiedIdeaFormat?: "text" | "markdown" | "agent-prompt" | null
  isShareLinkCopied?: boolean
  generationRateLimit: GenerationRateLimitStatus | null
  onSelectAlternativeName: (name: string) => void
  onRegenerateTitles: () => void
  onGeneratePitch: () => void
  onGenerateMarketValidation: () => void
  onCopyText: () => void
  onCopyMarkdown: () => void
  onCopyAgentPrompt: () => void
  onCopyShareLink: () => void
  onOpenSharedView: () => void
  onSave: () => void
  onRemove?: () => void
  defaultTab?: IdeaTab
}

type IdeaTab = "overview" | "analysis" | "pitch" | "validation"

const tabConfig: Array<{ value: IdeaTab; label: string; icon: LucideIcon }> = [
  { value: "overview", label: "Overview", icon: Lightbulb },
  { value: "analysis", label: "Analysis", icon: BarChart3 },
  { value: "pitch", label: "Pitch", icon: WandSparkles },
  { value: "validation", label: "Validation", icon: ShieldCheck },
]

function getValidationTone(score: number) {
  if (score <= 4) {
    return {
      label: "Weak idea",
      badgeClassName:
        "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-200",
    }
  }
  if (score <= 6) {
    return {
      label: "Moderate idea",
      badgeClassName:
        "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800/70 dark:bg-sky-950/60 dark:text-sky-200",
    }
  }
  return {
    label: "Strong idea",
    badgeClassName:
      "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200",
  }
}

export function IdeaCard({
  idea,
  pitch,
  marketValidation,
  headerActions,
  isPitchLoading,
  isMarketValidationLoading,
  isRegeneratingTitles = false,
  isSharing = false,
  isSaved = false,
  copiedIdeaFormat = null,
  isShareLinkCopied = false,
  generationRateLimit,
  onSelectAlternativeName,
  onRegenerateTitles,
  onGeneratePitch,
  onGenerateMarketValidation,
  onCopyText,
  onCopyMarkdown,
  onCopyAgentPrompt,
  onCopyShareLink,
  onOpenSharedView,
  onSave,
  onRemove,
  defaultTab = "overview",
}: IdeaCardProps) {
  const [tab, setTab] = useState<IdeaTab>(defaultTab)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!justSaved) return
    const timeout = window.setTimeout(() => setJustSaved(false), 1400)
    return () => window.clearTimeout(timeout)
  }, [justSaved])

  const CategoryIcon = getCategoryIcon(idea.category)
  const validationTone = getValidationTone(idea.validationScore)
  const titlesDisabled =
    isRegeneratingTitles || Boolean(generationRateLimit?.isExhausted)

  return (
    <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-7 p-6 md:p-8">
        {/* HEADER ROW */}
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase"
            >
              <CategoryIcon className="size-3.5 text-primary" />
              {idea.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase",
                validationTone.badgeClassName
              )}
            >
              <Compass className="size-3.5" />
              {validationTone.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ShareMenu
              isSharing={isSharing}
              copiedFormat={isShareLinkCopied ? "link" : copiedIdeaFormat}
              onCopyText={onCopyText}
              onCopyMarkdown={onCopyMarkdown}
              onCopyAgentPrompt={onCopyAgentPrompt}
              onCopyLink={onCopyShareLink}
              onOpenSharedView={onOpenSharedView}
            />
            {headerActions}
          </div>
        </header>

        {/* TITLE + SCORE */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h2 className="font-display text-4xl leading-[1.05] text-balance sm:text-5xl">
              {idea.name}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-foreground/80 text-pretty">
              {idea.tagline}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-muted/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionEyebrow className="mb-2">Validation</SectionEyebrow>
                <p className="text-sm leading-6 text-muted-foreground">
                  Composite score from timing, demand, defensibility, and fit.
                </p>
              </div>
              <ScoreRing
                value={idea.validationScore}
                size={104}
                strokeWidth={9}
                tone={idea.validationScore >= 7 ? "success" : idea.validationScore >= 5 ? "primary" : "warning"}
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as IdeaTab)}
          className="gap-6"
        >
          <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl border border-border/60 bg-muted/30 p-1">
            {tabConfig.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
                {value === "pitch" && !pitch ? (
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-muted-foreground/60" />
                ) : null}
                {value === "validation" && !marketValidation ? (
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-muted-foreground/60" />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
              <SectionEyebrow className="mb-2">Description</SectionEyebrow>
              <p className="text-sm leading-7 text-foreground">{idea.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(
                [
                  ["Target audience", idea.audience],
                  ["Unique twist", idea.twist],
                  ["Monetization", idea.monetization],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                >
                  <SectionEyebrow className="mb-2">{label}</SectionEyebrow>
                  <p className="text-sm leading-6 text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <SectionEyebrow className="mb-0">Other names we considered</SectionEyebrow>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={onRegenerateTitles}
                  disabled={titlesDisabled}
                >
                  {isRegeneratingTitles ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}
                  Generate new titles
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.alternativeNames.map((name) => {
                  const isSelected = name === idea.name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onSelectAlternativeName(name)}
                      className={cn(
                        "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border/60 bg-background/75 text-foreground/85 hover:bg-muted/60"
                      )}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <AnalysisDashboard idea={idea} />
          </TabsContent>

          <TabsContent value="pitch">
            <PitchSection
              pitch={pitch}
              isLoading={isPitchLoading}
              onGenerate={onGeneratePitch}
              disabled={Boolean(generationRateLimit?.isExhausted)}
            />
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
              <CardContent className="space-y-5 p-6 md:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <SectionEyebrow icon={ShieldCheck}>Market validation</SectionEyebrow>
                    <h3 className="font-display text-2xl leading-tight">
                      YC-style reality check
                    </h3>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      Ask Gemini to estimate competition, risks, and likely
                      early user groups before sharing or saving.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={onGenerateMarketValidation}
                    disabled={isMarketValidationLoading}
                    className="rounded-full"
                  >
                    {isMarketValidationLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {marketValidation ? "Refresh validation" : "Run validation"}
                  </Button>
                </div>
                {isMarketValidationLoading ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4"
                      >
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-3/6" />
                      </div>
                    ))}
                  </div>
                ) : marketValidation ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      {(
                        [
                          ["Competition", marketValidation.competition],
                          ["Risks", marketValidation.risks],
                          ["Potential users", marketValidation.potentialUsers],
                        ] as const
                      ).map(([label, items]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                        >
                          <SectionEyebrow className="mb-3">{label}</SectionEyebrow>
                          <ul className="space-y-2 text-sm leading-6 text-foreground">
                            {items.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-accent/50 p-5">
                      <SectionEyebrow className="mb-2">Verdict</SectionEyebrow>
                      <p className="text-sm leading-6 text-foreground">
                        {marketValidation.verdict}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
                    Run market validation to pressure-test the idea before
                    saving or sharing it.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FOOTER ACTIONS */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {generationRateLimit ? (
              <span
                className="inline-flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <Sparkles className="size-3.5 text-primary" />
                {generationRateLimit.isExhausted
                  ? `Generation cooldown active${
                      generationRateLimit.resetsAt
                        ? ` — resets ${new Date(generationRateLimit.resetsAt).toLocaleString()}`
                        : ""
                    }.`
                  : `${generationRateLimit.remaining} weekly generation credits left.`}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="rounded-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => {
                onSave()
                setJustSaved(true)
                toast.success(isSaved ? "Saved idea updated" : "Idea saved", {
                  description: "Your startup idea is stored in this browser.",
                })
              }}
              className="rounded-full"
            >
              {justSaved ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Bookmark className="size-4" />
              )}
              {justSaved
                ? isSaved
                  ? "Updated"
                  : "Saved"
                : isSaved
                  ? "Update saved idea"
                  : "Save idea"}
            </Button>
          </div>
        </footer>
      </CardContent>
    </Card>
  )
}

type ShareMenuProps = {
  isSharing: boolean
  copiedFormat: "text" | "markdown" | "agent-prompt" | "link" | null
  onCopyText: () => void
  onCopyMarkdown: () => void
  onCopyAgentPrompt: () => void
  onCopyLink: () => void
  onOpenSharedView: () => void
}

function ShareMenu({
  isSharing,
  copiedFormat,
  onCopyText,
  onCopyMarkdown,
  onCopyAgentPrompt,
  onCopyLink,
  onOpenSharedView,
}: ShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="rounded-full">
          <Share2 className="size-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Public link
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onCopyLink} disabled={isSharing}>
          {copiedFormat === "link" ? <Check className="text-primary" /> : <Globe />}
          {copiedFormat === "link" ? "Link copied" : "Copy share link"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenSharedView} disabled={isSharing}>
          <Rocket />
          Open public view
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Export
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onCopyText}>
          {copiedFormat === "text" ? <Check className="text-primary" /> : <Copy />}
          {copiedFormat === "text" ? "Copied text" : "Copy as text"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyMarkdown}>
          {copiedFormat === "markdown" ? <Check className="text-primary" /> : <FileCode2 />}
          {copiedFormat === "markdown" ? "Copied markdown" : "Copy as markdown"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyAgentPrompt}>
          {copiedFormat === "agent-prompt" ? (
            <Check className="text-primary" />
          ) : (
            <Clipboard />
          )}
          {copiedFormat === "agent-prompt" ? "Copied AI prompt" : "Copy as AI prompt"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
