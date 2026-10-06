"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from "recharts"
import { LineChart, Sparkles, TrendingUp } from "lucide-react"

import type { IdeaValueLadderStep, StartupIdea } from "@/types/idea"
import { Panel, PanelBody, PanelHeading } from "@/components/analysis/panel"
import { ScoreRing } from "@/components/score-ring"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

/** The three framework axes the radar reads, in display order. */
const fitAxes = ["Audience", "Community", "Product"] as const

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
        temperedFit.community * 0.2 -
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

  const fitData = fitAxes.map((axis) => ({
    axis,
    fit: temperedFit[axis.toLowerCase() as keyof typeof temperedFit],
  }))

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel className="lg:col-span-3">
        <PanelBody className="space-y-6">
          <PanelHeading
            icon={LineChart}
            label="Framework fit"
            title="Audience, community, and product pull"
            description="How strongly the concept connects to each side of the value equation. Drag a point to read an axis."
          />
          {mounted ? (
            <ChartContainer
              config={{ fit: { label: "Framework fit", icon: LineChart, color: "var(--chart-1)" } }}
              className="!aspect-auto mx-auto h-64 w-full max-w-sm sm:h-80 [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border/50"
            >
              <RadarChart data={fitData} outerRadius="70%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <PolarGrid radialLines={false} />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                {/* Radius ticks are omitted: at panel width they collide with the shape. */}
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="rounded-xl border-border/60 bg-popover/95 shadow-md"
                      hideLabel={false}
                      formatter={(value: unknown) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Framework fit
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {String(value)}/10
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Radar
                  dataKey="fit"
                  name="fit"
                  stroke="var(--color-fit)"
                  fill="var(--color-fit)"
                  fillOpacity={0.24}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ChartContainer>
          ) : (
            <div className="aspect-square w-full rounded-2xl border border-dashed border-border/60 bg-background/50" />
          )}
          <ul className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
            {fitData.map((point) => (
              <li key={point.axis} className="space-y-1">
                <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  {point.axis}
                </p>
                <p className="font-display text-2xl leading-none tabular-nums">
                  {point.fit}
                  <span className="text-xs text-muted-foreground">/10</span>
                </p>
              </li>
            ))}
          </ul>
        </PanelBody>
      </Panel>

      <Panel className="flex flex-col justify-between lg:col-span-2">
        <PanelBody className="space-y-2">
          <PanelHeading
            icon={Sparkles}
            label="Value equation"
            title="Composite case"
            description="Validation, product, audience, and community weighted into one read."
          />
        </PanelBody>
        <div className="flex flex-col items-center gap-4 px-6 pb-7">
          <ScoreRing
            value={valueEquationScore}
            size={148}
            strokeWidth={12}
            tone={valueEquationScore >= 7 ? "success" : valueEquationScore >= 5 ? "primary" : "warning"}
          />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <TrendingUp className="size-4 text-primary" aria-hidden="true" />
            {getValueEquationLabel(valueEquationScore)}
          </span>
        </div>
      </Panel>

      <Panel className="lg:col-span-5">
        <PanelBody className="space-y-5">
          <PanelHeading
            icon={TrendingUp}
            label="Value ladder"
            title="What unlocks, step by step"
            description="Each rung is the capability that has to land before the next one compounds."
          />
          {mounted ? (
            <ChartContainer
              config={{
                score: { label: "Value score", icon: TrendingUp, color: "var(--chart-2)" },
              }}
              className="!aspect-auto h-72 w-full sm:h-80 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/40"
            >
              <RechartsBarChart
                data={ladderData}
                layout="vertical"
                margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
                barCategoryGap="32%"
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 6" />
                <XAxis
                  type="number"
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="step"
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={
                    <ChartTooltipContent
                      className="rounded-xl border-border/60 bg-popover/95 shadow-md"
                      formatter={(value) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">Value score</span>
                          <span className="font-mono font-medium tabular-nums">
                            {value}/10
                          </span>
                        </div>
                      )}
                      labelFormatter={(_label, payload) =>
                        payload[0].payload.label ?? "Value ladder"
                      }
                      indicator="line"
                    />
                  }
                />
                <Bar
                  dataKey="score"
                  fill="var(--color-score)"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                />
              </RechartsBarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 w-full rounded-2xl border border-dashed border-border/60 bg-background/50 sm:h-80" />
          )}
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {temperedLadder.map((step, index) => (
              <li
                key={`${step.label}-${index}`}
                className="flex items-baseline gap-2.5 border-l border-border/70 pl-3"
              >
                <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm leading-6 text-foreground/85 text-pretty">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </PanelBody>
      </Panel>
    </div>
  )
}