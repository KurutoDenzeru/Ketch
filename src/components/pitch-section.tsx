"use client"

import { LoaderCircle, WandSparkles } from "lucide-react"

import type { StartupPitch } from "@/types/idea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SectionEyebrow } from "@/components/section-eyebrow"
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
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
      <CardContent className="space-y-5 p-6 md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <SectionEyebrow icon={WandSparkles}>Founder pitch</SectionEyebrow>
            <h3 className="font-display text-2xl leading-tight">
              Founder-ready narrative
            </h3>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Expand the idea into a short pitch covering the problem,
              solution, market, and business model.
            </p>
          </div>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || disabled}
            className="rounded-full"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <WandSparkles className="size-4" />
            )}
            {pitch ? "Regenerate pitch" : "Generate pitch"}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : pitch ? (
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["Problem", pitch.problem],
                ["Solution", pitch.solution],
                ["Market", pitch.market],
                ["Business model", pitch.businessModel],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/60 bg-muted/30 p-4"
              >
                <SectionEyebrow className="mb-2">{label}</SectionEyebrow>
                <p className="text-sm leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
            Generate a pitch to turn the concept into a crisp startup story.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
