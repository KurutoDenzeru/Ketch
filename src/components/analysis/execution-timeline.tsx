"use client"

import { Compass, Target } from "lucide-react"

import type { DetailedPlanStep } from "@/types/idea"
import { Panel, PanelBody } from "@/components/analysis/panel"

type ExecutionTimelineProps = {
  steps: Array<DetailedPlanStep>
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  return (
    <Panel>
      <PanelBody className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 pb-5">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            <Compass className="size-3.5" aria-hidden="true" />
            Detailed plan
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {steps.length} {steps.length === 1 ? "phase" : "phases"}
          </p>
        </div>

        <ol className="relative space-y-10">
          <span
            className="absolute top-2 bottom-2 left-[11px] w-px bg-border"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <li key={`${step.phase}-${index}`} className="relative pl-10">
              <span
                className="absolute top-0.5 left-0 inline-flex size-6 items-center justify-center rounded-full border border-primary/30 bg-background font-mono text-[11px] font-medium text-primary tabular-nums"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-display text-xl leading-tight text-balance">
                  {step.phase}
                </h3>
                <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  {step.timeframe}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground/85 text-pretty">
                {step.objective}
              </p>
              {step.actions.length > 0 ? (
                <ul className="mt-4 space-y-2 border-l border-border/60 pl-4">
                  {step.actions.map((action) => (
                    <li
                      key={action}
                      className="text-sm leading-6 text-muted-foreground text-pretty"
                    >
                      {action}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-4 inline-flex items-start gap-2 text-sm text-foreground">
                <Target
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-pretty">{step.outcome}</span>
              </p>
            </li>
          ))}
        </ol>
      </PanelBody>
    </Panel>
  )
}