"use client"

import {
  Activity,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  BriefcaseConveyorBelt,
  Building2,
  Cable,
  ChartColumn,
  ClipboardCheck,
  Coins,
  Compass,
  FileText,
  DollarSign,
  Gauge,
  GraduationCap,
  HeartPulse,
  KeyRound,
  Layers3,
  Lightbulb,
  LoaderCircle,
  MapPinned,
  MessageSquareMore,
  NotebookPen,
  Orbit,
  Radar,
  Receipt,
  Route,
  ScanSearch,
  School,
  Search,
  ShieldAlert,
  type LucideIcon,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Smartphone,
  Sparkles,
  Sprout,
  Store,
  TestTube2,
  Tags,
  Target,
  Trophy,
  UserRoundCheck,
  Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import type { FeaturePreference, IdeaBriefInput } from "@/types/idea"
import type { GenerationRateLimitStatus } from "@/types/rate-limit"
import {
  categoryFocusOptions,
  featurePreferences,
  ideaCategories,
} from "@/types/idea"

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

  function toggleFeature(feature: FeaturePreference) {
    const nextPreferences = brief.featurePreferences.includes(feature)
      ? brief.featurePreferences.filter((item) => item !== feature)
      : [...brief.featurePreferences, feature].slice(0, 4)

    onChange({ featurePreferences: nextPreferences })
  }

  return (
    <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
      <CardHeader className="gap-3 px-6 py-7 md:px-8 md:py-8">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
          >
            <BadgeCheck className="size-3.5" />
            Founder brief
          </Badge>
          <Badge
            variant="outline"
            className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
          >
            <Gauge className="size-3.5" />
            Idea evaluator
          </Badge>
        </div>
        <CardTitle className="font-display text-3xl leading-none">
          Tell the lab what you want to build
        </CardTitle>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Keep it quick. Founders should only need a rough concept, the problem,
          and who it is for. Everything else is guided with toggles.
        </p>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-7 md:px-8 md:pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            <Target className="size-3.5" />
            Startup Category
          </div>
          <div className="flex flex-wrap gap-2">
            {ideaCategories.map((option) => (
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
                  "rounded-full border px-4 py-2 text-sm transition-transform hover:-translate-y-0.5",
                  brief.category === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="size-4" />
              Idea direction
            </label>
            <Input
              value={brief.concept}
              onChange={(event) => onChange({ concept: event.target.value })}
              placeholder="AI copilot for restaurant hiring, dev tool for incident reviews, etc."
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Target className="size-4" />
              Target audience
            </label>
            <Input
              value={brief.audience}
              onChange={(event) => onChange({ audience: event.target.value })}
              placeholder="Solo founders, agencies, private clinics, indie devs..."
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Layers3 className="size-4" />
              Category focus
            </label>
            <Select
              value={brief.categoryFocus}
              onValueChange={(value) => onChange({ categoryFocus: value })}
            >
              <SelectTrigger className="!h-12 min-h-12 w-full rounded-xl px-3 py-0 text-base md:text-sm">
                <SelectValue placeholder="Choose a focus">
                  <span className="flex items-center gap-2">
                    <ActiveFocusIcon className="size-4 text-muted-foreground" />
                    <span>{brief.categoryFocus}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableFocuses.map((option) => {
                  const OptionIcon = getFocusIcon(option)

                  return (
                    <SelectItem key={option} value={option} className="py-2">
                      <OptionIcon className="size-4 text-muted-foreground" />
                      <SelectItemText>{option}</SelectItemText>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4" />
            Core problem
          </label>
          <Textarea
            value={brief.problem}
            onChange={(event) => onChange({ problem: event.target.value })}
            placeholder="What painful workflow, inefficiency, or market frustration should this solve?"
            className="min-h-28 rounded-2xl"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Tags className="size-4" />
            Desired features
          </label>
          <div className="flex flex-wrap gap-2">
            {featurePreferences.map((feature) => {
              const active = brief.featurePreferences.includes(feature)

              return (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm transition-transform hover:-translate-y-0.5",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  )}
                >
                  {feature}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs leading-6 text-muted-foreground">
              Tip: three inputs is enough. Use the toggles to steer the type of
              startup you want without turning the form into work.
            </p>
            <p className="text-xs leading-6 text-muted-foreground">
              {generationRateLimit
                ? generationRateLimit.isExhausted
                  ? `Weekly generation cooldown active. ${generationRateLimit.limit}/${generationRateLimit.limit} used.${generationRateLimit.resetsAt ? ` Resets ${new Date(generationRateLimit.resetsAt).toLocaleString()}.` : ""}`
                  : `${generationRateLimit.remaining} of ${generationRateLimit.limit} weekly generation credits left.`
                : "Checking generation cooldown..."}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={isLoading || !hasGenerationCredits}
            className="rounded-full px-5"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {brief.concept.trim() ? "Evaluate Idea" : "Generate Idea"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getFocusIcon(focus: string): LucideIcon {
  const normalized = focus.toLowerCase()

  if (normalized.includes("agent")) return BrainCircuit
  if (normalized.includes("content generation")) return Sparkle
  if (normalized.includes("research")) return Search
  if (normalized.includes("copilot")) return Orbit
  if (normalized.includes("internal")) return Building2
  if (normalized.includes("team productivity")) return BriefcaseBusiness
  if (normalized.includes("vertical")) return Layers3
  if (normalized.includes("analytics")) return ChartColumn
  if (normalized.includes("ci/cd")) return Route
  if (normalized.includes("observability")) return Gauge
  if (normalized.includes("testing")) return TestTube2
  if (normalized.includes("developer productivity")) return Wrench
  if (normalized.includes("habit")) return Activity
  if (normalized.includes("consumer utility")) return Smartphone
  if (normalized.includes("wellness")) return HeartPulse
  if (normalized.includes("local discovery")) return MapPinned
  if (normalized.includes("matching")) return Cable
  if (normalized.includes("services marketplace")) return Store
  if (normalized.includes("niche communities")) return UserRoundCheck
  if (normalized.includes("local supply")) return Compass
  if (normalized.includes("expense")) return Receipt
  if (normalized.includes("embedded finance")) return Coins
  if (normalized.includes("smb finance")) return DollarSign
  if (normalized.includes("personal wealth")) return Trophy
  if (normalized.includes("practice operations")) return ClipboardCheck
  if (normalized.includes("patient engagement")) return HeartPulse
  if (normalized.includes("mental health")) return Activity
  if (normalized.includes("compliance")) return ClipboardCheck
  if (normalized.includes("audience growth")) return ChartColumn
  if (normalized.includes("monetization")) return DollarSign
  if (normalized.includes("editing workflow")) return NotebookPen
  if (normalized.includes("content planning")) return FileText
  if (normalized.includes("upskilling")) return GraduationCap
  if (normalized.includes("test prep")) return School
  if (normalized.includes("micro-learning")) return BrainCircuit
  if (normalized.includes("school workflow")) return School
  if (normalized.includes("store optimization")) return ShoppingBag
  if (normalized.includes("post-purchase")) return Receipt
  if (normalized.includes("creator commerce")) return Store
  if (normalized.includes("inventory")) return BriefcaseConveyorBelt
  if (normalized.includes("security training")) return ShieldCheck
  if (normalized.includes("appsec")) return ShieldAlert
  if (normalized.includes("identity")) return KeyRound
  if (normalized.includes("threat detection")) return Radar
  if (normalized.includes("energy efficiency")) return Sprout
  if (normalized.includes("carbon tracking")) return ScanSearch
  if (normalized.includes("climate adaptation")) return Compass
  if (normalized.includes("circular economy")) return Route
  if (normalized.includes("interest graph")) return Orbit
  if (normalized.includes("messaging")) return MessageSquareMore
  if (normalized.includes("status sharing")) return Sparkles
  if (normalized.includes("creator community")) return UserRoundCheck
  if (normalized.includes("back-office automation"))
    return BriefcaseConveyorBelt
  if (normalized.includes("scheduling")) return Route
  if (normalized.includes("field operations")) return Compass
  if (normalized.includes("documentation")) return FileText

  return Layers3
}
