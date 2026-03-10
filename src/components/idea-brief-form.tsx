"use client"

import {
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
  Telescope,
  Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { IdeaBriefInput } from "@/types/idea"
import { ideaCategories } from "@/types/idea"

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
  return (
    <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
      <CardHeader className="gap-3 px-6 py-6">
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
          Give the model your idea direction, audience, or unfair advantage. If
          you leave fields loose, the lab will fill gaps with a realistic
          startup concept and then evaluate it.
        </p>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6">
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
                onClick={() => onChange({ category: option })}
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

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="size-4" />
              Idea direction
            </label>
            <Input
              value={brief.concept}
              onChange={(event) => onChange({ concept: event.target.value })}
              placeholder="AI copilot for restaurant hiring, dev tool for incident reviews, etc."
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Telescope className="size-4" />
              Founder edge
            </label>
            <Textarea
              value={brief.founderEdge}
              onChange={(event) =>
                onChange({ founderEdge: event.target.value })
              }
              placeholder="Distribution advantage, domain knowledge, technical moat, personal network..."
              className="min-h-28 rounded-2xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Wrench className="size-4" />
            Constraints or preferences
          </label>
          <Textarea
            value={brief.constraints}
            onChange={(event) => onChange({ constraints: event.target.value })}
            placeholder="Budget, timeline, no-code preference, solo founder constraints, B2B only, mobile-first, etc."
            className="min-h-24 rounded-2xl"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-6 text-muted-foreground">
            Tip: leave the idea direction loose and be specific about the
            problem. That usually produces stronger evaluations.
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
