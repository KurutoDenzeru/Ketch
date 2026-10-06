"use client"

import { Clock3, Flag, Search, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { IdeaAnalysis } from "@/types/idea"
import { Panel, PanelBody, StrengthMeter } from "@/components/analysis/panel"

type Section = {
  label: string
  icon: LucideIcon
}

const sections: Array<keyof Pick<
  IdeaAnalysis,
  "whyNow" | "proofSignals" | "marketGap" | "executionPlan"
>> = ["whyNow", "proofSignals", "marketGap", "executionPlan"]

const sectionConfig: Record<(typeof sections)[number], Section> = {
  whyNow: { label: "Why now", icon: Clock3 },
  proofSignals: { label: "Proof and signals", icon: Sparkles },
  marketGap: { label: "The market gap", icon: Search },
  executionPlan: { label: "Execution plan", icon: Flag },
}

type ProofSignalsProps = {
  analysis: IdeaAnalysis
}

/** Proof-signal list spans the full row so the 2-column grid stays balanced. */
export function ProofSignals({ analysis }: ProofSignalsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:grid-flow-dense">
      {sections.map((key) => {
        const config = sectionConfig[key]
        const signals = key === "proofSignals" ? analysis.proofSignals : null

        return (
          <Panel
            key={key}
            className={signals ? "md:col-span-2" : undefined}
          >
            <PanelBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  <config.icon className="size-3.5" aria-hidden="true" />
                  {config.label}
                </p>
                {signals ? (
                  <StrengthMeter
                    level={
                      signals.length >= 4
                        ? "high"
                        : signals.length >= 2
                          ? "medium"
                          : "low"
                    }
                  />
                ) : null}
              </div>

              {signals ? (
                signals.length > 0 ? (
                  <ul className="grid gap-2.5 md:grid-cols-2">
                    {signals.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85"
                      >
                        <span
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <span className="text-pretty">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No proof signals surfaced for this concept yet.
                  </p>
                )
              ) : (
                <p className="text-sm leading-7 text-foreground/85 text-pretty">
                  {analysis[key]}
                </p>
              )}
            </PanelBody>
          </Panel>
        )
      })}
    </div>
  )
}