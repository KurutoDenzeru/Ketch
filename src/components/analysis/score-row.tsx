"use client"

import { Clock3, Compass,  Shield, Sparkles, TrendingUp } from "lucide-react"
import type {LucideIcon} from "lucide-react";

import type { IdeaScoreMetric } from "@/types/idea"
import { Progress } from "@/components/ui/progress"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { cn } from "@/lib/utils"

const metricIconMap: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /timing|now/i, icon: Clock3 },
  { match: /defens|moat|competition/i, icon: Shield },
  { match: /execution|build|ship/i, icon: Compass },
  { match: /opportun|market/i, icon: TrendingUp },
]

export function getMetricIcon(label: string): LucideIcon {
  for (const entry of metricIconMap) {
    if (entry.match.test(label)) {
      return entry.icon
    }
  }
  return Sparkles
}

export function getMetricTone(score: number) {
  if (score <= 4) {
    return "text-amber-700 dark:text-amber-300"
  }
  if (score <= 7) {
    return "text-sky-700 dark:text-sky-300"
  }
  return "text-emerald-700 dark:text-emerald-300"
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function temperScore(score: number, penalty = 1.4) {
  return clamp(Math.round(score * 0.78 - penalty), 1, 10)
}

type ScoreRowProps = {
  metrics: Array<IdeaScoreMetric>
}

export function ScoreRow({ metrics }: ScoreRowProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {metrics.map((metric) => {
        const Icon = getMetricIcon(metric.label)
        const score = temperScore(metric.score, 1.2)
        return (
          <div
            key={metric.label}
            className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/80 p-5 shadow-xs"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SectionEyebrow className="mb-1.5" icon={Icon}>
                  {metric.label}
                </SectionEyebrow>
                <div className={cn("font-display text-4xl leading-none tabular-nums", getMetricTone(score))}>
                  {score}
                  <span className="text-base text-muted-foreground">/10</span>
                </div>
              </div>
              <div className="rounded-full border border-border/60 bg-background/85 p-2">
                <Icon className="size-4" aria-hidden="true" />
              </div>
            </div>
            <Progress value={score * 10} className="mb-3 h-2" />
            <p className="text-sm leading-6 text-muted-foreground">{metric.insight}</p>
          </div>
        )
      })}
    </div>
  )
}
