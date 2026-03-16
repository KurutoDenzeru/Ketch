"use client"

import { useEffect, useState } from "react"
import {
  BadgeCheck,
  Check,
  Copy,
  Gauge,
  LoaderCircle,
  RefreshCcw,
  Rocket,
  Save,
  ShieldCheck,
} from "lucide-react"

import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { PitchSection } from "@/components/pitch-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { MarketValidation, StartupIdea, StartupPitch } from "@/types/idea"
import type { GenerationRateLimitStatus } from "@/types/rate-limit"

type IdeaCardProps = {
  idea: StartupIdea
  pitch: StartupPitch | null
  marketValidation: MarketValidation | null
  isPitchLoading: boolean
  isMarketValidationLoading: boolean
  isRegeneratingTitles?: boolean
  isSharing?: boolean
  isShareLinkCopied?: boolean
  generationRateLimit: GenerationRateLimitStatus | null
  isSaved: boolean
  onSelectAlternativeName: (name: string) => void
  onRegenerateTitles: () => void
  onGeneratePitch: () => void
  onGenerateMarketValidation: () => void
  onCopy: () => void
  onCopyShareLink: () => void
  onOpenSharedView: () => void
  onSave: () => void
}

function getValidationTone(score: number) {
  if (score <= 3) {
    return {
      label: "Weak idea",
      badgeClassName:
        "border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-100",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    }
  }

  if (score <= 6) {
    return {
      label: "Moderate idea",
      badgeClassName: "border-sky-200 bg-sky-100 text-sky-900 hover:bg-sky-100",
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-sky-500",
    }
  }

  return {
    label: "Strong idea",
    badgeClassName:
      "border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200",
    progressClassName: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
  }
}

export function IdeaCard({
  idea,
  pitch,
  marketValidation,
  isPitchLoading,
  isMarketValidationLoading,
  isRegeneratingTitles = false,
  isSharing = false,
  isShareLinkCopied = false,
  generationRateLimit,
  isSaved,
  onSelectAlternativeName,
  onRegenerateTitles,
  onGeneratePitch,
  onGenerateMarketValidation,
  onCopy,
  onCopyShareLink,
  onOpenSharedView,
  onSave,
}: IdeaCardProps) {
  const [isValidationOpen, setIsValidationOpen] = useState(
    Boolean(marketValidation)
  )

  useEffect(() => {
    if (marketValidation) {
      setIsValidationOpen(true)
    }
  }, [marketValidation])

  const validationTone = getValidationTone(idea.validationScore)
  const titlesDisabled =
    isRegeneratingTitles || Boolean(generationRateLimit?.isExhausted)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 py-0 shadow-sm">
        <CardHeader className="gap-5 border-b border-border/70 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <BadgeCheck className="size-3.5" />
              {idea.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase",
                validationTone.badgeClassName
              )}
            >
              <Gauge className="size-3.5" />
              {validationTone.label}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <CardTitle className="font-display text-4xl leading-none text-balance md:text-5xl">
                {idea.name}
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-foreground/80">
                {idea.tagline}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {idea.alternativeNames.map((name) => {
                    const isSelected = name === idea.name

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onSelectAlternativeName(name)}
                        className={cn(
                          "inline-flex h-auto items-center rounded-full border px-3 py-1.5 text-sm transition-transform hover:-translate-y-0.5",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 bg-background/75 text-foreground hover:bg-muted/60"
                        )}
                      >
                        {name}
                      </button>
                    )
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRegenerateTitles}
                    disabled={titlesDisabled}
                    className="rounded-full"
                  >
                    {isRegeneratingTitles ? (
                      <RefreshCcw className="animate-spin" />
                    ) : (
                      <RefreshCcw />
                    )}
                    Generate new titles
                  </Button>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  {generationRateLimit
                    ? generationRateLimit.isExhausted
                      ? `Generation cooldown active until ${generationRateLimit.resetsAt ? new Date(generationRateLimit.resetsAt).toLocaleString() : "later this week"}.`
                      : `${generationRateLimit.remaining} weekly generation credits remaining for fresh ideas and title refreshes.`
                    : "Checking generation cooldown..."}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/35 p-4">
              <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Validation Score
              </div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <span className="font-display text-4xl leading-none">
                  {idea.validationScore}
                </span>
                <span className="text-sm text-muted-foreground">out of 10</span>
              </div>
              <Progress
                value={idea.validationScore * 10}
                className={cn("h-2.5", validationTone.progressClassName)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-5">
              <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Description
              </div>
              <p className="text-sm leading-7 text-foreground">
                {idea.description}
              </p>
            </div>

            <div className="grid gap-4">
              {[
                ["Target audience", idea.audience],
                ["Unique twist", idea.twist],
                ["Monetization", idea.monetization],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
                >
                  <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                  </div>
                  <p className="text-sm leading-6 text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <AnalysisDashboard idea={idea} />

          <Separator />

          <Collapsible
            open={isValidationOpen}
            onOpenChange={setIsValidationOpen}
            className="rounded-[1.75rem] border border-border/70 bg-background/85"
          >
            <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  AI Market Validation
                </div>
                <h3 className="font-display text-2xl leading-none">
                  Mini YC-style reality check
                </h3>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Ask Gemini to estimate competition, risks, and likely early
                  user groups.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={onGenerateMarketValidation}
                  disabled={isMarketValidationLoading}
                  className="rounded-full px-4"
                >
                  {isMarketValidationLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <ShieldCheck />
                  )}
                  {marketValidation ? "Refresh Validation" : "Run Validation"}
                </Button>

                {marketValidation ? (
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      {isValidationOpen ? "Hide details" : "Show details"}
                    </Button>
                  </CollapsibleTrigger>
                ) : null}
              </div>
            </div>

            <CollapsibleContent className="px-5 pb-5">
              <Separator className="mb-5" />

              {isMarketValidationLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
                    >
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ))}
                </div>
              ) : marketValidation ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Competition",
                      items: marketValidation.competition,
                    },
                    {
                      label: "Risks",
                      items: marketValidation.risks,
                    },
                    {
                      label: "Potential users",
                      items: marketValidation.potentialUsers,
                    },
                  ].map(({ label, items }) => (
                    <div
                      key={label}
                      className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
                    >
                      <div className="mb-3 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                        {label}
                      </div>
                      <div className="space-y-2 text-sm leading-6 text-foreground">
                        {items.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-[1.5rem] border border-border/70 bg-accent/50 p-4 md:col-span-3">
                    <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                      Verdict
                    </div>
                    <p className="text-sm leading-6 text-foreground">
                      {marketValidation.verdict}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                  Run market validation to pressure-test the idea before saving
                  or sharing it.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-3 border-t border-border/70 bg-muted/35 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onCopy}>
              <Copy />
              Copy idea
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCopyShareLink}
              disabled={isSharing}
            >
              {isShareLinkCopied ? <Check /> : <Copy />}
              Copy share link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenSharedView}
              disabled={isSharing}
            >
              <Rocket />
              Open shared view
            </Button>
          </div>

          <Button type="button" onClick={onSave} className="rounded-full px-4">
            <Save />
            {isSaved ? "Update saved idea" : "Save idea"}
          </Button>
        </CardFooter>
      </Card>

      <PitchSection
        pitch={pitch}
        isLoading={isPitchLoading}
        onGenerate={onGeneratePitch}
      />
    </div>
  )
}
