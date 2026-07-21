"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { LineChart, TrendingDown, TrendingUp } from "lucide-react"

import type { StartupIdea } from "@/types/idea"
import { SectionEyebrow } from "@/components/section-eyebrow"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function temperInterest(interest: number) {
  return clamp(Math.round(interest * 0.72 - 6), 8, 86)
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

function buildKeywordOptions(idea: StartupIdea) {
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

function buildPeriodLabels(count: number) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  })
  const ref = new Date(2026, 5, 1)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      ref.getFullYear(),
      ref.getMonth() - (count - 1 - index),
      1
    )
    return formatter.format(date)
  })
}

function getDemandVolumeRange(volume: string) {
  const normalized = volume.toLowerCase()
  if (normalized.includes("high")) return { min: 5000, max: 18000 }
  if (normalized.includes("low")) return { min: 250, max: 2200 }
  return { min: 1500, max: 8000 }
}

function roundDemandVolume(value: number) {
  if (value >= 10000) return Math.round(value / 500) * 500
  if (value >= 5000) return Math.round(value / 250) * 250
  if (value >= 1000) return Math.round(value / 100) * 100
  return Math.round(value / 50) * 50
}

function getAxisUpperBound(maxValue: number) {
  if (maxValue <= 2500) return Math.ceil(maxValue / 250) * 250
  if (maxValue <= 10000) return Math.ceil(maxValue / 1000) * 1000
  return Math.ceil(maxValue / 2000) * 2000
}

function buildTicks(maxValue: number) {
  const upper = getAxisUpperBound(maxValue)
  const step = upper / 4
  return Array.from({ length: 5 }, (_, index) => Math.round(step * index))
}

type TrendChartProps = {
  idea: StartupIdea
}

export function TrendChart({ idea }: TrendChartProps) {
  const keywordOptions = buildKeywordOptions(idea)
  const [selectedKeyword, setSelectedKeyword] = useState(
    keywordOptions[0] ?? ""
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSelectedKeyword(keywordOptions[0] ?? "")
    setMounted(true)
  }, [keywordOptions])

  const activeSignal =
    idea.analysis.keywordSignals.find((signal) => signal.term === selectedKeyword) ??
    deriveFallbackSignal(
      selectedKeyword || keywordOptions[0] || idea.name,
      keywordOptions.findIndex((item) => item === selectedKeyword),
      idea
    )

  const signalScore = activeSignal.score
  const signalVolume = activeSignal.volume
  const signalCompetition = activeSignal.competition

  const trendLabels = buildPeriodLabels(Math.min(7, idea.analysis.trendPoints.length))
  const rawTrendPoints = idea.analysis.trendPoints
    .slice(0, trendLabels.length)
    .map((point, index) => {
      const base = temperInterest(point.interest)
      const signalBoost = 0.78 + signalScore / 10
      const volumeBoost = getVolumeMultiplier(signalVolume)
      const competitionPenalty = getCompetitionPenalty(signalCompetition)
      const directionalMomentum =
        (index - (trendLabels.length - 1) / 2) * (1.6 + signalScore * 0.18)
      return {
        ...point,
        label: trendLabels[index] ?? point.label,
        interest: clamp(
          Math.round(
            base * signalBoost * volumeBoost * competitionPenalty +
              directionalMomentum
          ),
          12,
          100
        ),
      }
    })

  const isFlat =
    rawTrendPoints.length > 1 &&
    rawTrendPoints.every(
      (point) => point.interest === rawTrendPoints[0]?.interest
    )
  const temperedTrendPoints = isFlat
    ? rawTrendPoints.map((point, index) => ({
        ...point,
        interest: clamp(point.interest + index * 3 - 6, 12, 100),
      }))
    : rawTrendPoints

  const demandVolumeRange = getDemandVolumeRange(signalVolume)
  const chartData = temperedTrendPoints.map((point) => ({
    ...point,
    volume: roundDemandVolume(
      demandVolumeRange.min +
        ((demandVolumeRange.max - demandVolumeRange.min) * point.interest) / 100
    ),
  }))

  const latestVolume = chartData[chartData.length - 1]?.volume ?? 0
  const firstVolume = chartData[0]?.volume ?? latestVolume
  const growth = clamp(
    Math.round(
      firstVolume > 0
        ? ((latestVolume - firstVolume) / firstVolume) * 100
        : 0
    ),
    -95,
    999
  )

  const maxVolume = Math.max(...chartData.map((point) => point.volume))
  const upperBound = getAxisUpperBound(maxVolume)
  const ticks = buildTicks(maxVolume)

  const config = {
    volume: { label: "Search volume", color: "var(--chart-1)" },
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xs md:p-7">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <SectionEyebrow icon={LineChart}>Market timing</SectionEyebrow>
          <h3 className="font-display text-2xl leading-tight">
            Search and interest curve
          </h3>
          {(
            <Select
              value={activeSignal.term}
              onValueChange={setSelectedKeyword}
            >
              <SelectTrigger className="h-11 w-full min-w-0 max-w-full rounded-2xl border-border/60 bg-background/85 sm:min-w-72">
                <span className="text-muted-foreground">Keyword:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {keywordOptions.map((term) => (
                  <SelectItem key={term} value={term}>
                    <SelectItemText>{formatKeywordLabel(term)}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Current
            </p>
            <p className="mt-1 font-display text-3xl leading-none tabular-nums text-primary">
              {latestVolume.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Growth
            </p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 font-display text-3xl leading-none tabular-nums",
                growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )}
            >
              {growth >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {growth >= 0 ? "+" : ""}
              {growth}%
            </p>
          </div>
        </div>
      </div>

      {mounted ? (
        <ChartContainer config={config} className="!aspect-auto h-72 w-full">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              minTickGap={0}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[0, upperBound]}
              ticks={ticks}
              tickFormatter={(value: number) =>
                value >= 1000
                  ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
                  : `${value}`
              }
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value: unknown) => [
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value),
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
      ) : (
        <div className="h-72 w-full rounded-2xl border border-dashed border-border/60 bg-background/50" />
      )}
    </div>
  )
}
