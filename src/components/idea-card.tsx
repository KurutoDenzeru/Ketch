"use client"

import { cn } from "cn"
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
import type { LucideIcon } from "lucide-react";

import type { MarketValidation, StartupIdea, StartupPitch } from "@/types/idea"
import type { GenerationRateLimitStatus } from "@/types/rate-limit"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { PitchSection } from "@/components/pitch-section"
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
  /** "report" drops the internal hero for hosts that render the name themselves. */
  variant?: "card" | "report"
}

type IdeaTab = "overview" | "analysis" | "pitch" | "validation"

const tabConfig: Array<{ value: IdeaTab; label: string; icon: LucideIcon }> = [
  { value: "overview", label: "Overview", icon: Lightbulb },
  { value: "analysis", label: "Analysis", icon: BarChart3 },
  { value: "pitch", label: "Pitch", icon: WandSparkles },
  { value: "validation", label: "Validation", icon: ShieldCheck },
]

function getValidationWord(score: number) {
  if (score <= 4) return "Weak idea"
  if (score <= 6) return "Moderate idea"
  return "Strong idea"
}

function getValidationTone(score: number) {
  if (score <= 4) return "text-amber-600 dark:text-amber-400"
  if (score <= 6) return "text-sky-700 dark:text-sky-300"
  return "text-emerald-600 dark:text-emerald-400"
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
  variant = "card",
}: IdeaCardProps) {
  const [tab, setTab] = useState<IdeaTab>(defaultTab)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!justSaved) return
    const timeout = window.setTimeout(() => setJustSaved(false), 1400)
    return () => window.clearTimeout(timeout)
  }, [justSaved])

  const CategoryIcon = getCategoryIcon(idea.category)
  const titlesDisabled =
    isRegeneratingTitles || Boolean(generationRateLimit?.isExhausted)

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 py-0 shadow-sm transition-[border-color,box-shadow] duration-700 ease-out hover:border-foreground/15 hover:shadow-md">
      <CardContent className="space-y-8 p-5 sm:space-y-10 sm:p-6 md:p-8">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between md:pb-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CategoryIcon className="size-4 text-primary" aria-hidden="true" />
              {idea.category}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-2",
                getValidationTone(idea.validationScore)
              )}
            >
              <Compass className="size-4" aria-hidden="true" />
              {getValidationWord(idea.validationScore)}
            </span>
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

        {variant === "card" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-end lg:gap-8">
            <div className="space-y-4">
              <h2 className="max-w-[18ch] font-display text-3xl leading-[1.04] tracking-[-0.03em] text-balance sm:text-4xl md:text-5xl">
                {idea.name}
              </h2>
              <p className="max-w-2xl text-base leading-8 text-foreground/80 text-pretty md:text-lg">
                {idea.tagline}
              </p>
            </div>
            <div className="flex items-center gap-5 border-t border-border/60 pt-5 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div className="space-y-1">
                <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Validation
                </p>
                <p className="text-sm leading-6 text-muted-foreground text-pretty">
                  Composite of timing, demand, defensibility, and fit.
                </p>
              </div>
              <ScoreRing
                value={idea.validationScore}
                size={96}
                strokeWidth={9}
                tone={
                  idea.validationScore >= 7
                    ? "success"
                    : idea.validationScore >= 5
                      ? "primary"
                      : "warning"
                }
              />
            </div>
          </div>
        ) : null}

        {/* TABS */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as IdeaTab)}
          className="gap-6 md:gap-8"
        >
          <TabsList className="w-full flex-nowrap gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-muted/30 p-1 md:flex-wrap md:overflow-visible">
            {tabConfig.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="shrink-0 rounded-xl px-3 transition-colors duration-500"
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

          <TabsContent value="overview" className="space-y-8">
            <section className="space-y-3">
              <SectionEyebrow>Description</SectionEyebrow>
              <p className="max-w-3xl text-base leading-8 text-foreground/85 text-pretty">
                {idea.description}
              </p>
            </section>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:grid-flow-dense">
              {(
                [
                  ["Target audience", idea.audience],
                  ["Unique twist", idea.twist],
                  ["Monetization", idea.monetization],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="space-y-2 border-t border-border/70 pt-4"
                >
                  <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="text-sm leading-7 text-foreground/85 text-pretty">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionEyebrow>Other names we considered</SectionEyebrow>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateTitles}
                  disabled={titlesDisabled}
                >
                  {isRegeneratingTitles ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCcw className="size-4" aria-hidden="true" />
                  )}
                  Generate new titles
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {idea.alternativeNames.map((name) => {
                  const isSelected = name === idea.name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onSelectAlternativeName(name)}
                      className={cn(
                        "border-b pb-0.5 text-sm transition-colors duration-500 focus-visible:rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                        isSelected
                          ? "border-primary text-foreground"
                          : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-foreground"
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

          <TabsContent value="validation" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <SectionEyebrow icon={ShieldCheck}>Market validation</SectionEyebrow>
                <h3 className="font-display text-2xl leading-tight text-balance">
                  YC-style reality check
                </h3>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground text-pretty">
                  Ask Gemini to estimate competition, risks, and likely early
                  user groups before sharing or saving.
                </p>
              </div>
              <Button
                type="button"
                onClick={onGenerateMarketValidation}
                disabled={isMarketValidationLoading}
              >
                {isMarketValidationLoading ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-4" aria-hidden="true" />
                )}
                {marketValidation ? "Refresh validation" : "Run validation"}
              </Button>
            </div>
            {isMarketValidationLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="space-y-3 border-t border-border/70 pt-4"
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-3/6" />
                  </div>
                ))}
              </div>
            ) : marketValidation ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                  {(
                    [
                      ["Competition", marketValidation.competition],
                      ["Risks", marketValidation.risks],
                      ["Potential users", marketValidation.potentialUsers],
                    ] as const
                  ).map(([label, items]) => (
                    <div
                      key={label}
                      className="space-y-3 border-t border-border/70 pt-4"
                    >
                      <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        {label}
                      </p>
                      <ul className="space-y-2 text-sm leading-6 text-foreground/85">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span
                              className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                            <span className="text-pretty">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-l-2 border-primary pl-5">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Verdict
                  </p>
                  <p className="max-w-3xl text-base leading-8 text-foreground text-pretty">
                    {marketValidation.verdict}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border/60 bg-muted/20 p-6 text-sm leading-7 text-muted-foreground">
                Run market validation to pressure-test the idea before saving
                or sharing it.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* FOOTER ACTIONS */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {generationRateLimit ? (
              <span
                className="inline-flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
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
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
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
            >
              {justSaved ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Bookmark className="size-4" aria-hidden="true" />
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
        <Button type="button" variant="outline">
          <Share2 className="size-4" aria-hidden="true" />
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