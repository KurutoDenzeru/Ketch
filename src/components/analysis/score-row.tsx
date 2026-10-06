"use client"

import { cn } from "cn"
import { Clock3, Compass, Shield, Sparkles, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { IdeaScoreMetric } from "@/types/idea"
import { Panel, StrengthMeter } from "@/components/analysis/panel"

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = getMetricIcon(metric.label)
        const score = temperScore(metric.score, 1.2)
        return (
          <Panel
            key={metric.label}
            className="group/metric flex h-full flex-col justify-between gap-5 p-5 transition-[border-color,box-shadow] duration-700 ease-out hover:border-foreground/15 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                <Icon className="size-3.5" aria-hidden="true" />
                {metric.label}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-4xl leading-none font-semibold tabular-nums sm:text-5xl",
                    getMetricTone(score)
                  )}
                >
                  {score}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">/10</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border/70">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none",
                    score <= 4
                      ? "bg-amber-500"
                      : score <= 7
                        ? "bg-chart-2"
                        : "bg-brand-green"
                  )}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
              <StrengthMeter
                level={score <= 4 ? "low" : score <= 7 ? "medium" : "high"}
              />
            </div>
            <p className="text-sm leading-6 text-muted-foreground text-pretty">
              {metric.insight}
            </p>
          </Panel>
        )
      })}
    </div>
  )
}