"use client"

import { LoaderCircle, WandSparkles } from "lucide-react"

import type { StartupPitch } from "@/types/idea"
import { Panel, PanelBody, PanelHeading } from "@/components/analysis/panel"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type PitchSectionProps = {
  pitch: StartupPitch | null
  isLoading: boolean
  onGenerate: () => void
  disabled?: boolean
}

export function PitchSection({
  pitch,
  isLoading,
  onGenerate,
  disabled,
}: PitchSectionProps) {
  return (
    <Panel>
      <PanelBody className="space-y-8">
        <PanelHeading
          icon={WandSparkles}
          label="Founder pitch"
          title="Founder-ready narrative"
          description="The concept expanded into a short story a founder can read out loud."
          action={
            <Button type="button" onClick={onGenerate} disabled={isLoading || disabled}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <WandSparkles className="size-4" aria-hidden="true" />
              )}
              {pitch ? "Regenerate" : "Generate"}
            </Button>
          }
        />

        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : pitch ? (
          <div className="space-y-8">
            <blockquote className="border-l-2 border-primary pl-6">
              <p className="font-display text-xl leading-relaxed text-balance text-foreground italic">
                {pitch.solution}
              </p>
            </blockquote>
            <div className="grid gap-8 md:grid-cols-3 md:gap-10">
              {(
                [
                  ["The problem", pitch.problem],
                  ["The market", pitch.market],
                  ["Business model", pitch.businessModel],
                ] as const
              ).map(([label, value]) => (
                <section key={label} className="space-y-2">
                  <h4 className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </h4>
                  <p className="text-[0.95rem] leading-8 text-foreground/85 text-pretty">
                    {value}
                  </p>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border/60 bg-muted/20 p-6 text-sm leading-7 text-muted-foreground">
            Generate a pitch to turn the concept into a crisp startup story.
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}