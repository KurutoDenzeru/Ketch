"use client"

import {
  AlertTriangle,
  BrainCircuit,
  Check,
  Compass,
  Gauge,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react"

import type { GenerationRateLimitStatus } from "@/types/rate-limit"
import type {FeaturePreference, IdeaBriefInput} from "@/types/idea";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getCategoryIcon, getFocusIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"
import {
  
  
  categoryFocusOptions,
  featurePreferences,
  ideaCategories
} from "@/types/idea"

const MAX_FEATURES = 4

type IdeaBriefFormProps = {
  brief: IdeaBriefInput
  onChange: (patch: Partial<IdeaBriefInput>) => void
  onSubmit: () => void
  isLoading: boolean
  generationRateLimit: GenerationRateLimitStatus | null
}

export function IdeaBriefForm({
  brief,
  onChange,
  onSubmit,
  isLoading,
  generationRateLimit,
}: IdeaBriefFormProps) {
  const availableFocuses = categoryFocusOptions[brief.category]
  const ActiveFocusIcon = getFocusIcon(brief.categoryFocus)
  const hasGenerationCredits = (generationRateLimit?.remaining ?? 1) > 0
  const isExhausted = Boolean(generationRateLimit?.isExhausted)
  const concept = brief.concept.trim()
  const canSubmit = !isLoading && hasGenerationCredits

  function toggleFeature(feature: FeaturePreference) {
    const isActive = brief.featurePreferences.includes(feature)
    if (isActive) {
      onChange({
        featurePreferences: brief.featurePreferences.filter((item) => item !== feature),
      })
      return
    }
    onChange({
      featurePreferences: [...brief.featurePreferences, feature].slice(0, MAX_FEATURES),
    })
  }

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-7 p-6 md:p-8">
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            <Compass className="mr-1.5 inline size-3.5" />
            Category
          </Label>
          <div className="flex flex-wrap gap-2">
            {ideaCategories.map((option) => {
              const Icon = getCategoryIcon(option)
              const active = brief.category === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    onChange({
                      category: option,
                      categoryFocus: categoryFocusOptions[option][0],
                    })
                  }
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border/60 bg-background/70 text-foreground/80 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="concept" className="inline-flex items-center gap-1.5">
              <Lightbulb className="size-4 text-primary" />
              Idea direction
            </Label>
            <Input
              id="concept"
              value={brief.concept}
              onChange={(event) => onChange({ concept: event.target.value })}
              placeholder="An AI copilot for restaurant hiring, a dev tool for incident reviews, etc."
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience" className="inline-flex items-center gap-1.5">
              <UserRound className="size-4 text-primary" />
              Target audience
            </Label>
            <Input
              id="audience"
              value={brief.audience}
              onChange={(event) => onChange({ audience: event.target.value })}
              placeholder="Solo founders, agencies, private clinics, indie devs…"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem" className="inline-flex items-center gap-1.5">
            <Target className="size-4 text-primary" />
            Core problem
          </Label>
          <Textarea
            id="problem"
            value={brief.problem}
            onChange={(event) => onChange({ problem: event.target.value })}
            placeholder="What painful workflow, inefficiency, or market frustration should this solve?"
            className="min-h-28 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            <BrainCircuit className="size-4 text-primary" />
            Category focus
          </Label>
          <Select
            value={brief.categoryFocus}
            onValueChange={(value) => onChange({ categoryFocus: value })}
          >
            <SelectTrigger
              id="categoryFocus"
              className="!h-11 w-full rounded-xl"
            >
              <SelectValue placeholder="Choose a focus">
                <span className="flex items-center gap-2">
                  <ActiveFocusIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>{brief.categoryFocus}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableFocuses.map((option) => {
                const OptionIcon = getFocusIcon(option)
                return (
                  <SelectItem key={option} value={option} className="py-2">
                    <OptionIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <SelectItemText>{option}</SelectItemText>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <Label className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              Desired features
            </Label>
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {brief.featurePreferences.length}/{MAX_FEATURES}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {featurePreferences.map((feature) => {
              const active = brief.featurePreferences.includes(feature)
              const limitReached =
                !active && brief.featurePreferences.length >= MAX_FEATURES
              return (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  disabled={limitReached}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border/60 bg-background/70 text-foreground/80 hover:border-border hover:bg-muted/60"
                  )}
                >
                  {active ? <Check className="size-3.5" /> : null}
                  {feature}
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <GenerationStatus
            generationRateLimit={generationRateLimit}
            isExhausted={isExhausted}
          />
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            size="lg"
            className="rounded-full px-5"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {concept ? "Evaluate idea" : "Generate idea"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function GenerationStatus({
  generationRateLimit,
  isExhausted,
}: {
  generationRateLimit: GenerationRateLimitStatus | null
  isExhausted: boolean
}) {
  if (isExhausted) {
    return (
      <p
        className="inline-flex items-center gap-1.5 text-xs leading-5 text-muted-foreground"
        suppressHydrationWarning
      >
        <AlertTriangle className="size-3.5 text-amber-500" />
        Weekly cooldown active.
        {generationRateLimit?.resetsAt
          ? ` Resets ${new Date(generationRateLimit.resetsAt).toLocaleString()}.`
          : ""}
      </p>
    )
  }
  if (generationRateLimit) {
    return (
      <p
        className="inline-flex items-center gap-1.5 text-xs leading-5 text-muted-foreground"
        suppressHydrationWarning
      >
        <Gauge className="size-3.5 text-primary" />
        {generationRateLimit.remaining}/{generationRateLimit.limit} weekly
        generation credits left.
      </p>
    )
  }
  return (
    <p className="inline-flex items-center gap-1.5 text-xs leading-5 text-muted-foreground">
      <Gauge className="size-3.5" />
      Checking generation cooldown…
    </p>
  )
}

