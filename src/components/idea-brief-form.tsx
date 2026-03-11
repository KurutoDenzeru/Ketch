"use client"

import {
  Layers3,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Tags,
  Target,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { FeaturePreference, IdeaBriefInput } from "@/types/idea"
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
}

export function IdeaBriefForm({
  brief,
  onChange,
  onSubmit,
  isLoading,
}: IdeaBriefFormProps) {
  const availableFocuses = categoryFocusOptions[brief.category]

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
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Founder brief
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
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
              <SelectTrigger className="h-12 w-full rounded-xl">
                <SelectValue placeholder="Choose a focus" />
              </SelectTrigger>
              <SelectContent>
                {availableFocuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
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
          <p className="text-xs leading-6 text-muted-foreground">
            Tip: three inputs is enough. Use the toggles to steer the type of
            startup you want without turning the form into work.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={isLoading}
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
