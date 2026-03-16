"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
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
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

function getVolumeMultiplier(volume: string) {
  const normalized = volume.toLowerCase()
  if (normalized.includes("high")) return 1.28
  if (normalized.includes("med")) return 1
  if (normalized.includes("low")) return 0.76
  return 0.92
}

function getCompetitionPenalty(competition: string) {
  const normalized = competition.toLowerCase()
  if (normalized.includes("high")) return 0.92
  if (normalized.includes("medium")) return 1
  if (normalized.includes("low")) return 1.08
  return 1
}

function formatKeywordLabel(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildDemandKeywordOptions(idea: StartupIdea) {
  const candidates = [
    ...idea.analysis.keywordSignals.map((signal) => signal.term),
    ...idea.analysis.tags.map((tag) => tag.replace(/-/g, " ")),
    `${idea.name.toLowerCase()} software`,
    `${idea.category.toLowerCase()} platform`,
  ]

  return candidates
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, 7)
}

function deriveFallbackSignal(term: string, index: number, idea: StartupIdea) {
  const seededScore = clamp(
    Math.round(
      (idea.validationScore + (term.length % 5) + Math.max(index, 0)) / 2.1
    ),
    3,
    8
  )

  return {
    term,
    volume: seededScore >= 7 ? "High" : seededScore >= 5 ? "Medium" : "Low",
    competition:
      seededScore >= 7 ? "High" : seededScore >= 5 ? "Medium" : "Low",
    score: seededScore,
  }
}

function buildDemandPeriodLabels(count: number) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  })
  const now = new Date()

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (count - 1 - index),
      1
    )

    return formatter.format(date)
  })
}

function getDemandVolumeRange(volume: string) {
  const normalized = volume.toLowerCase()

  if (normalized.includes("high")) {
    return { min: 5000, max: 18000 }
  }

  if (normalized.includes("low")) {
    return { min: 250, max: 2200 }
  }

  return { min: 1500, max: 8000 }
}

function roundDemandVolume(value: number) {
  if (value >= 10000) return Math.round(value / 500) * 500
  if (value >= 5000) return Math.round(value / 250) * 250
  if (value >= 1000) return Math.round(value / 100) * 100
  return Math.round(value / 50) * 50
}

function getDemandAxisUpperBound(maxValue: number) {
  if (maxValue <= 2500) return Math.ceil(maxValue / 250) * 250
  if (maxValue <= 10000) return Math.ceil(maxValue / 1000) * 1000

  return Math.ceil(maxValue / 2000) * 2000
}

function buildDemandTicks(maxValue: number) {
  const upperBound = getDemandAxisUpperBound(maxValue)
  const step = upperBound / 4

  return Array.from({ length: 5 }, (_, index) => Math.round(step * index))
}

export function AnalysisDashboard({ idea }: AnalysisDashboardProps) {
  const keywordOptions = buildDemandKeywordOptions(idea)
  const [selectedKeyword, setSelectedKeyword] = useState(
    keywordOptions[0] ?? ""
  )

  useEffect(() => {
    setSelectedKeyword(keywordOptions[0] ?? "")
  }, [keywordOptions])

  const activeKeywordSignal =
    idea.analysis.keywordSignals.find(
      (signal) => signal.term === selectedKeyword
    ) ??
    deriveFallbackSignal(
      selectedKeyword || keywordOptions[0] || idea.name,
      keywordOptions.findIndex((item) => item === selectedKeyword),
      idea
    )

  const trendLabels = buildDemandPeriodLabels(
    Math.min(7, idea.analysis.trendPoints.length)
  )

  const rawTrendPoints = idea.analysis.trendPoints
    .slice(0, trendLabels.length)
    .map((point, index) => {
      const baseInterest = temperInterest(point.interest)
      const signalScore = activeKeywordSignal?.score ?? 5
      const signalBoost = 0.78 + signalScore / 10
      const volumeBoost = getVolumeMultiplier(
        activeKeywordSignal?.volume ?? "Medium"
      )
      const competitionPenalty = getCompetitionPenalty(
        activeKeywordSignal?.competition ?? "Medium"
      )
      const directionalMomentum =
        (index - (trendLabels.length - 1) / 2) * (1.6 + signalScore * 0.18)

      return {
        ...point,
        label: trendLabels[index] ?? point.label,
        interest: clamp(
          Math.round(
            baseInterest * signalBoost * volumeBoost * competitionPenalty +
              directionalMomentum
          ),
          12,
          100
        ),
      }
    })

  const trendPointsAreFlat =
    rawTrendPoints.length > 1 &&
    rawTrendPoints.every(
      (point) => point.interest === rawTrendPoints[0]?.interest
    )

  const temperedTrendPoints = trendPointsAreFlat
    ? rawTrendPoints.map((point, index) => ({
        ...point,
        interest: clamp(point.interest + index * 3 - 6, 12, 100),
      }))
    : rawTrendPoints

  const demandVolumeRange = getDemandVolumeRange(
    activeKeywordSignal?.volume ?? "Medium"
  )
  const trendChartData = temperedTrendPoints.map((point) => ({
    ...point,
    volume: roundDemandVolume(
      demandVolumeRange.min +
        ((demandVolumeRange.max - demandVolumeRange.min) * point.interest) / 100
    ),
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
  const maxTrendVolume = Math.max(
    ...trendChartData.map((point) => point.volume)
  )
  const yAxisUpperBound = getDemandAxisUpperBound(maxTrendVolume)
  const yAxisTicks = buildDemandTicks(maxTrendVolume)

  const trendConfig = {
    volume: {
      label: "Search volume",
      color: "var(--chart-1)",
    },
  }

  const validationGaugeData = [
    {
      name: "score",
      value: valueEquationScore * 10,
      fill: "var(--chart-4)",
    },
  ]

  const valueLadderChartData = temperedValueLadder.map((step, index) => ({
    step: `Step ${index + 1}`,
    score: step.score,
    label: step.label,
  }))

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
              className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
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
            <div className="space-y-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <LineChart className="size-3.5" />
                Demand Signal
              </div>
              <h3 className="font-display text-2xl leading-none">
                Search and interest curve
              </h3>

              {activeKeywordSignal ? (
                <Select
                  value={activeKeywordSignal.term}
                  onValueChange={setSelectedKeyword}
                >
                  <SelectTrigger className="h-11 min-w-[16rem] rounded-2xl border-border/70 bg-background/85 px-4">
                    <span className="text-muted-foreground">Keyword:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {keywordOptions.map((term) => (
                      <SelectItem key={term} value={term}>
                        <SelectItemText>
                          {formatKeywordLabel(term)}
                        </SelectItemText>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>

            <div className="grid gap-3 text-right sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                <div className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Current
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

          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-3 gap-y-3">
            <div className="flex min-h-[22rem] items-center justify-center pt-2">
              <span className="-rotate-90 text-[11px] font-semibold tracking-[0.22em] whitespace-nowrap text-muted-foreground uppercase">
                Search Results
              </span>
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
                  interval={0}
                  minTickGap={0}
                  tickMargin={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  domain={[0, yAxisUpperBound]}
                  ticks={yAxisTicks}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
                      : `${value}`
                  }
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => [
                        typeof value === "number"
                          ? value.toLocaleString()
                          : value,
                        "Search volume",
                      ]}
                    />
                  }
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

            <div />
            <div className="pt-1 text-center text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Recent Months
            </div>
          </div>
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

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                <BarChart3 className="size-3.5" />
                Value Ladder
              </div>
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-3 gap-y-3">
                <div className="flex min-h-[20rem] items-center justify-center pt-2">
                  <span className="-rotate-90 text-[11px] font-semibold tracking-[0.22em] whitespace-nowrap text-muted-foreground uppercase">
                    Value Score
                  </span>
                </div>

                <ChartContainer
                  config={{
                    score: {
                      label: "Value score",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="!aspect-auto h-[20rem] min-h-[20rem] w-full"
                >
                  <RechartsBarChart
                    data={valueLadderChartData}
                    margin={{ top: 18, right: 8, left: 4, bottom: 18 }}
                    barCategoryGap={20}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="step"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tickMargin={14}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={44}
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                    />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.18)" }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => [
                            `${value}/10`,
                            item?.payload?.label ?? "Value score",
                          ]}
                          labelFormatter={(_label, payload) =>
                            payload?.[0]?.payload?.label ?? "Value ladder"
                          }
                          indicator="line"
                        />
                      }
                    />
                    <Bar
                      dataKey="score"
                      fill="var(--color-score)"
                      radius={[18, 18, 6, 6]}
                    />
                  </RechartsBarChart>
                </ChartContainer>

                <div />
                <div className="pt-1 text-center text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Value Ladder Step
                </div>
              </div>
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
                <Badge
                  variant="outline"
                  className="h-auto rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
                >
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
