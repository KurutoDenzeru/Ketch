"use client"

import { useEffect, useState } from "react"
import { Bar, CartesianGrid, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts"
import { BarChart3, LineChart, Sparkles } from "lucide-react"

import type { IdeaValueLadderStep, StartupIdea } from "@/types/idea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { ScoreRing } from "@/components/score-ring"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function temperScore(score: number, penalty = 1.4) {
  return clamp(Math.round(score * 0.78 - penalty), 1, 10)
}

function getValueEquationLabel(score: number) {
  if (score <= 3) return "Weak pull"
  if (score <= 5) return "Needs proof"
  if (score <= 7) return "Promising"
  return "Strong case"
}

type FitAndLadderProps = {
  idea: StartupIdea
}

export function FitAndLadder({ idea }: FitAndLadderProps) {
  const temperedFit = {
    audience: temperScore(idea.analysis.frameworkFit.audience, 1.5),
    community: temperScore(idea.analysis.frameworkFit.community, 1.8),
    product: temperScore(idea.analysis.frameworkFit.product, 1.3),
  }

  const temperedLadder: Array<IdeaValueLadderStep> = idea.analysis.valueLadder.map(
    (step, index) => ({
      ...step,
      score: temperScore(step.score, 1.6 + index * 0.35),
    })
  )

  const valueEquationScore = clamp(
    Math.round(
      idea.validationScore * 0.45 +
        temperedFit.product * 0.2 +
        temperedFit.audience * 0.2 +
        0 -
        1.5
    ),
    1,
    10
  )

  const ladderData = temperedLadder.map((step, index) => ({
    step: `Step ${index + 1}`,
    score: step.score,
    label: step.label,
  }))

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
        <CardContent className="space-y-4 p-6">
          <SectionEyebrow icon={LineChart}>Framework fit</SectionEyebrow>
          <div className="space-y-4">
            {(
              [
                ["Audience", temperedFit.audience],
                ["Community", temperedFit.community],
                ["Product", temperedFit.product],
              ] as const
            ).map(([label, score]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium tabular-nums">{score}/10</span>
                </div>
                <Progress value={score * 10} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <SectionEyebrow icon={Sparkles}>Value equation</SectionEyebrow>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase",
                valueEquationScore >= 7
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : valueEquationScore >= 5
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
              )}
            >
              {getValueEquationLabel(valueEquationScore)}
            </span>
          </div>
          <div className="flex items-center justify-center py-2">
            <ScoreRing value={valueEquationScore} size={140} strokeWidth={12} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card lg:col-span-2">
        <CardContent className="space-y-4 p-6">
          <SectionEyebrow icon={BarChart3}>Value ladder</SectionEyebrow>
          {mounted ? (
            <ChartContainer
              config={{ score: { label: "Value score", color: "var(--chart-1)" } }}
              className="!aspect-auto h-72 w-full"
            >
              <RechartsBarChart
                data={ladderData}
                margin={{ top: 12, right: 8, left: 4, bottom: 12 }}
                barCategoryGap={20}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="step" tickLine={false} axisLine={false} tickMargin={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => [
                        `${value}/10`,
                        item.payload.label ?? "Value score",
                      ]}
                      labelFormatter={(_label, payload) =>
                        payload[0].payload.label ?? "Value ladder"
                      }
                      indicator="line"
                    />
                  }
                />
                <Bar dataKey="score" fill="var(--color-score)" radius={[18, 18, 6, 6]} />
              </RechartsBarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 w-full rounded-2xl border border-dashed border-border/60 bg-background/50" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
