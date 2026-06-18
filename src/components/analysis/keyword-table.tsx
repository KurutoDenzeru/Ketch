"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"

import type { IdeaKeywordSignal } from "@/types/idea"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SortKey = "score" | "volume" | "competition" | "term"
type SortDirection = "asc" | "desc"

const volumeRank: Record<string, number> = { low: 1, medium: 2, high: 3 }

type KeywordTableProps = {
  signals: Array<IdeaKeywordSignal>
}

function numericVolume(value: string) {
  return volumeRank[value.toLowerCase()] ?? 2
}

export function KeywordTable({ signals }: KeywordTableProps) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [direction, setDirection] = useState<SortDirection>("desc")

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    const base = lower
      ? signals.filter((signal) => signal.term.toLowerCase().includes(lower))
      : signals
    const sorted = [...base].sort((a, b) => {
      const compareValue = (() => {
        switch (sortKey) {
          case "term":
            return a.term.localeCompare(b.term)
          case "volume":
            return numericVolume(a.volume) - numericVolume(b.volume)
          case "competition":
            return numericVolume(a.competition) - numericVolume(b.competition)
          case "score":
          default:
            return a.score - b.score
        }
      })()
      return direction === "asc" ? compareValue : -compareValue
    })
    return sorted
  }, [signals, query, sortKey, direction])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setDirection("desc")
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <SectionEyebrow icon={Search}>Keyword signals</SectionEyebrow>
          <h3 className="font-display text-xl leading-tight">
            Demand and competition per term
          </h3>
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter terms…"
            className="h-10 rounded-full pl-9"
            aria-label="Filter keyword signals"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            <tr>
              <SortHeader
                label="Term"
                active={sortKey === "term"}
                direction={direction}
                onClick={() => toggleSort("term")}
              />
              <SortHeader
                label="Volume"
                active={sortKey === "volume"}
                direction={direction}
                onClick={() => toggleSort("volume")}
              />
              <SortHeader
                label="Competition"
                active={sortKey === "competition"}
                direction={direction}
                onClick={() => toggleSort("competition")}
              />
              <SortHeader
                label="Score"
                active={sortKey === "score"}
                direction={direction}
                onClick={() => toggleSort("score")}
              />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No keyword signals match that filter.
                </td>
              </tr>
            ) : (
              filtered.map((signal) => (
                <tr
                  key={signal.term}
                  className="border-t border-border/60 bg-background/85 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-medium">{signal.term}</td>
                  <td className="px-4 py-3 text-muted-foreground">{signal.volume}</td>
                  <td className="px-4 py-3 text-muted-foreground">{signal.competition}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex h-7 min-w-12 items-center justify-center rounded-full px-2.5 text-xs font-semibold tabular-nums",
                        signal.score >= 7
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : signal.score >= 5
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                      )}
                    >
                      {signal.score}/10
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type SortHeaderProps = {
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
}

function SortHeader({ label, active, direction, onClick }: SortHeaderProps) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown
  const align = label === "Score" ? "text-right" : "text-left"
  return (
    <th className={cn("px-4 py-3 font-semibold", align)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] tracking-[0.18em] uppercase transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className="size-3" />
      </button>
    </th>
  )
}
