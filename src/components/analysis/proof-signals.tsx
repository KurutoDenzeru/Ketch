"use client"

import { Clock3, Flag,  Search, Sparkles } from "lucide-react"
import type {LucideIcon} from "lucide-react";

import type { IdeaAnalysis } from "@/types/idea"
import { Card, CardContent } from "@/components/ui/card"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Section = {
  label: string
  value: string
  icon: LucideIcon
}

const sections: Array<keyof Pick<
  IdeaAnalysis,
  "whyNow" | "proofSignals" | "marketGap" | "executionPlan"
>> = ["whyNow", "proofSignals", "marketGap", "executionPlan"]

const sectionConfig: Record<(typeof sections)[number], Section> = {
  whyNow: { label: "Why now", value: "", icon: Clock3 },
  proofSignals: { label: "Proof & signals", value: "", icon: Sparkles },
  marketGap: { label: "The market gap", value: "", icon: Search },
  executionPlan: { label: "Execution plan", value: "", icon: Flag },
}

type ProofSignalsProps = {
  analysis: IdeaAnalysis
}

function formatProofSignals(signals: Array<string>) {
  return signals.length > 0 ? signals.map((item) => `• ${item}`).join("  ") : "—"
}

export function ProofSignals({ analysis }: ProofSignalsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((key) => {
        const config = { ...sectionConfig[key] }
        const value =
          key === "proofSignals"
            ? formatProofSignals(analysis.proofSignals)
            : analysis[key]
        return (
          <Card
            key={key}
            className="rounded-2xl border border-border/60 bg-card/80 py-0 shadow-xs"
          >
            <CardContent className="space-y-3 p-5">
              <SectionEyebrow icon={config.icon}>{config.label}</SectionEyebrow>
              <p className="text-sm leading-7 text-foreground">{value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
