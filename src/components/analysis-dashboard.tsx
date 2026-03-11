"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts"
import {
  BadgeCheck,
  BarChart3,
  Clock3,
  Compass,
  Flag,
  LineChart,
  Search,
  Shield,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { StartupIdea } from "@/types/idea"

type AnalysisDashboardProps = {
  idea: StartupIdea
}

function getMetricIcon(label: string) {
  if (/timing|now/i.test(label)) return Clock3
  if (/defens|moat|competition/i.test(label)) return Shield
  if (/execution|build|ship/i.test(label)) return Compass
  if (/opportun|market/i.test(label)) return TrendingUp
  return Sparkles
}

function getMetricTone(score: number) {
  if (score <= 4) return "text-amber-700 dark:text-amber-300"
  if (score <= 7) return "text-sky-700 dark:text-sky-300"
  return "text-emerald-700 dark:text-emerald-300"
}

export function AnalysisDashboard({ idea }: AnalysisDashboardProps) {
  const trendConfig = {
    interest: {
      label: "Signal strength",
      color: "var(--chart-1)",
    },
  }

  const ladderConfig = {
    score: {
      label: "Strength",
      color: "var(--chart-2)",
    },
  }

  const validationGaugeData = [
    {
      name: "score",
      value: idea.validationScore * 10,
      fill: "var(--chart-4)",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          <Tag className="size-3.5" />
          Tags
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.analysis.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="h-auto rounded-full px-3 py-1.5"
            >
              <BadgeCheck className="size-3.5" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="grid h-full grid-rows-[auto_1fr] rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <LineChart className="size-3.5" />
                Demand Signal
              </div>
              <h3 className="font-display text-2xl leading-none">
                Search and interest curve
              </h3>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-right">
              <div className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Trend ceiling
              </div>
              <div className="font-display text-3xl leading-none">
                {Math.max(
                  ...idea.analysis.trendPoints.map((point) => point.interest)
                )}
              </div>
            </div>
          </div>

          <ChartContainer
            config={trendConfig}
            className="h-full min-h-[18rem] w-full"
          >
            <AreaChart data={idea.analysis.trendPoints}>
              <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-interest)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-interest)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stroke="var(--color-interest)"
                fill="url(#trendFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {idea.analysis.scoreMetrics.map((metric) => {
            const Icon = getMetricIcon(metric.label)

            return (
              <div
                key={metric.label}
                className="flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-muted/25 p-4"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      {metric.label}
                    </div>
                    <div
                      className={cn(
                        "font-display text-4xl leading-none",
                        getMetricTone(metric.score)
                      )}
                    >
                      {metric.score}
                      <span className="text-lg text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <div className="rounded-full border border-border/70 bg-background/85 p-2">
                    <Icon className="size-4" />
                  </div>
                </div>
                <Progress value={metric.score * 10} className="mb-3 h-2.5" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {metric.insight}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          {[
            {
              label: "Why Now?",
              value: idea.analysis.whyNow,
              icon: Clock3,
            },
            {
              label: "Proof & Signals",
              value: idea.analysis.proofSignals.join(" "),
              icon: Sparkles,
            },
            {
              label: "The Market Gap",
              value: idea.analysis.marketGap,
              icon: Search,
            },
            {
              label: "Execution Plan",
              value: idea.analysis.executionPlan,
              icon: Flag,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <Icon className="size-3.5" />
                {label}
              </div>
              <p className="text-sm leading-7 text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <BarChart3 className="size-3.5" />
                Framework Fit
              </div>
              <div className="space-y-4">
                {[
                  ["Audience", idea.analysis.frameworkFit.audience],
                  ["Community", idea.analysis.frameworkFit.community],
                  ["Product", idea.analysis.frameworkFit.product],
                ].map(([label, score]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium">{score}/10</span>
                    </div>
                    <Progress value={Number(score) * 10} className="h-2.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <TrendingUp className="size-3.5" />
                Value Equation
              </div>
              <ChartContainer
                config={{
                  score: {
                    label: "Validation",
                    color: "var(--chart-4)",
                  },
                }}
                className="h-48 w-full"
              >
                <RadialBarChart
                  data={validationGaugeData}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={56}
                  outerRadius={92}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar dataKey="value" cornerRadius={10} background />
                  <text
                    x="50%"
                    y="54%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-4xl font-semibold"
                  >
                    {idea.validationScore}
                  </text>
                  <text
                    x="50%"
                    y="68%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs tracking-[0.2em] uppercase"
                  >
                    Good Fit
                  </text>
                </RadialBarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <Users className="size-3.5" />
                Keyword Signals
              </div>
              <div className="space-y-3">
                {idea.analysis.keywordSignals.map((signal) => (
                  <div
                    key={signal.term}
                    className="rounded-2xl border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <p className="text-sm leading-6 font-medium text-foreground">
                        {signal.term}
                      </p>
                      <span className="text-sm font-semibold text-primary">
                        {signal.volume}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                      <span>{signal.competition}</span>
                      <span>{signal.score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <BarChart3 className="size-3.5" />
                Value Ladder
              </div>
              <ChartContainer config={ladderConfig} className="h-60 w-full">
                <BarChart data={idea.analysis.valueLadder}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="score"
                    fill="var(--color-score)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          <Compass className="size-3.5" />
          Full Detailed Plan
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {idea.analysis.detailedPlan.map((step, index) => (
            <div
              key={`${step.phase}-${index}`}
              className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {step.timeframe}
                  </div>
                  <h4 className="font-display text-2xl leading-none">
                    {step.phase}
                  </h4>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Step {index + 1}
                </Badge>
              </div>
              <p className="mb-4 text-sm leading-7 text-foreground">
                {step.objective}
              </p>
              <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                {step.actions.map((action) => (
                  <p
                    key={action}
                    className="rounded-xl bg-background/80 px-3 py-2"
                  >
                    {action}
                  </p>
                ))}
              </div>
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-3 text-sm">
                <span className="mr-2 font-medium text-foreground">
                  Outcome:
                </span>
                {step.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
