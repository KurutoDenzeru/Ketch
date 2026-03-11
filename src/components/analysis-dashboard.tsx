"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function temperScore(score: number, penalty = 1.4) {
  return clamp(Math.round(score * 0.78 - penalty), 1, 10)
}

function temperInterest(interest: number) {
  return clamp(Math.round(interest * 0.72 - 6), 8, 86)
}

function getValueEquationLabel(score: number) {
  if (score <= 3) return "Weak pull"
  if (score <= 5) return "Needs proof"
  if (score <= 7) return "Promising"
  return "Strong case"
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
  const temperedTrendPoints = idea.analysis.trendPoints.map((point) => ({
    ...point,
    interest: temperInterest(point.interest),
  }))

  const trendChartData = temperedTrendPoints.map((point) => ({
    ...point,
    volume: point.interest * 20,
  }))

  const temperedScoreMetrics = idea.analysis.scoreMetrics.map((metric) => ({
    ...metric,
    score: temperScore(metric.score, 1.2),
  }))

  const temperedFrameworkFit = {
    audience: temperScore(idea.analysis.frameworkFit.audience, 1.5),
    community: temperScore(idea.analysis.frameworkFit.community, 1.8),
    product: temperScore(idea.analysis.frameworkFit.product, 1.3),
  }

  const temperedValueLadder = idea.analysis.valueLadder.map((step, index) => ({
    ...step,
    score: temperScore(step.score, 1.6 + index * 0.35),
  }))

  const valueEquationScore = clamp(
    Math.round(
      idea.validationScore * 0.45 +
        temperedFrameworkFit.product * 0.2 +
        temperedFrameworkFit.audience * 0.2 +
        Math.max(...temperedTrendPoints.map((point) => point.interest)) / 20 -
        1.5
    ),
    1,
    10
  )

  const latestTrendVolume =
    trendChartData[trendChartData.length - 1]?.volume ?? 0
  const firstTrendVolume = trendChartData[0]?.volume ?? latestTrendVolume
  const trendGrowth = clamp(
    Math.round(
      firstTrendVolume > 0
        ? ((latestTrendVolume - firstTrendVolume) / firstTrendVolume) * 100
        : 0
    ),
    -95,
    999
  )
  const maxTrendVolume = Math.max(...trendChartData.map((point) => point.volume))
  const yAxisUpperBound = Math.max(2000, Math.ceil(maxTrendVolume / 500) * 500)

  const trendConfig = {
    volume: {
      label: "Search volume",
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
      value: valueEquationScore * 10,
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

            <div className="grid gap-3 text-right sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                <div className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Volume
                </div>
                <div className="font-display text-3xl leading-none text-primary">
                  {latestTrendVolume.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                <div className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Growth
                </div>
                <div
                  className={cn(
                    "font-display text-3xl leading-none",
                    trendGrowth >= 0 ? "text-emerald-500" : "text-amber-500"
                  )}
                >
                  {trendGrowth >= 0 ? "+" : ""}
                  {trendGrowth}%
                </div>
              </div>
            </div>
          </div>

          <ChartContainer
            config={trendConfig}
            className="!aspect-auto h-[22rem] min-h-[22rem] w-full"
          >
            <AreaChart
              data={trendChartData}
              margin={{ top: 24, right: 12, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-volume)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-volume)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="plainline"
                wrapperStyle={{ paddingBottom: "12px" }}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Topic cluster",
                  position: "insideBottom",
                  offset: -4,
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                domain={[0, yAxisUpperBound]}
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`
                }
                label={{
                  value: "Volume",
                  angle: -90,
                  position: "insideLeft",
                  offset: -2,
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="volume"
                name="Search volume"
                stroke="var(--color-volume)"
                fill="url(#trendFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {temperedScoreMetrics.map((metric) => {
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
                  ["Audience", temperedFrameworkFit.audience],
                  ["Community", temperedFrameworkFit.community],
                  ["Product", temperedFrameworkFit.product],
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
                className="!aspect-auto h-48 w-full"
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
                    {valueEquationScore}
                  </text>
                  <text
                    x="50%"
                    y="68%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs tracking-[0.2em] uppercase"
                  >
                    {getValueEquationLabel(valueEquationScore)}
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
              <ChartContainer
                config={ladderConfig}
                className="!aspect-auto h-[18rem] w-full"
              >
                <BarChart
                  data={temperedValueLadder}
                  margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                >
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
