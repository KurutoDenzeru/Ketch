"use client"

import { cn } from "cn"
import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"

import type { IdeaKeywordSignal } from "@/types/idea"
import { Panel, PanelHeading } from "@/components/analysis/panel"
import { Input } from "@/components/ui/input"

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
    const normalized = query.trim().toLowerCase()
    return signals
      .filter(
        (signal) =>
          !normalized ||
          signal.term.toLowerCase().includes(normalized) ||
          signal.volume.toLowerCase().includes(normalized) ||
          signal.competition.toLowerCase().includes(normalized)
      )
      .sort((a, b) => {
        let comparison = 0
        if (sortKey === "term") {
          comparison = a.term.localeCompare(b.term)
        } else if (sortKey === "volume") {
          comparison = numericVolume(a.volume) - numericVolume(b.volume)
        } else if (sortKey === "competition") {
          comparison = numericVolume(a.competition) - numericVolume(b.competition)
        } else {
          comparison = a.score - b.score
        }
        return direction === "asc" ? comparison : -comparison
      })
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
    <Panel>
      <div className="p-5 sm:p-6 md:p-7">
        <PanelHeading
          icon={Search}
          label="Keyword signals"
          title="Demand and competition per term"
          description="Sort or filter the set to see which words carry real search intent."
          action={
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter terms"
                className="h-10 rounded-xl pl-9"
                aria-label="Filter keyword signals"
              />
            </div>
          }
        />
      </div>

      <div className="max-h-[28rem] overflow-x-auto overflow-y-auto border-t border-border/60">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="sticky top-0 z-10 bg-muted/70 text-[11px] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-sm">
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
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No keyword signals match that filter.
                </td>
              </tr>
            ) : (
              filtered.map((signal) => (
                <tr
                  key={signal.term}
                  className="border-t border-border/50 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-4 font-medium text-balance">{signal.term}</td>
                  <td className="px-4 py-4 text-muted-foreground tabular-nums">
                    {signal.volume}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground tabular-nums">
                    {signal.competition}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={cn(
                        "font-display text-xl leading-none tabular-nums",
                        signal.score >= 7
                          ? "text-emerald-600 dark:text-emerald-400"
                          : signal.score >= 5
                            ? "text-sky-700 dark:text-sky-300"
                            : "text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {signal.score}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                      /10
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
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
  const align = label === "Score" ? "justify-end" : "justify-start"
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:text-foreground",
          align,
          active ? "text-foreground" : "text-muted-foreground"
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className="size-3" aria-hidden="true" />
      </button>
    </th>
  )
}