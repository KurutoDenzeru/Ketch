"use client"

import { Compass } from "lucide-react"

import type { DetailedPlanStep } from "@/types/idea"
import { SectionEyebrow } from "@/components/section-eyebrow"

type ExecutionTimelineProps = {
  steps: Array<DetailedPlanStep>
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card md:p-7">
      <SectionEyebrow icon={Compass} className="mb-5">
        Detailed plan
      </SectionEyebrow>

      <ol className="relative space-y-6">
        <span
          className="absolute top-2 bottom-2 left-[15px] w-px bg-border"
          aria-hidden="true"
        />
        {steps.map((step, index) => (
          <li key={`${step.phase}-${index}`} className="relative pl-12">
            <span
              className="absolute top-1 left-0 inline-flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <h4 className="font-display text-xl leading-tight">{step.phase}</h4>
              <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {step.timeframe}
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-foreground/85">
              {step.objective}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {step.actions.map((action) => (
                <li key={action} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-medium text-foreground/80">
              Outcome · {step.outcome}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
