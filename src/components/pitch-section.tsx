"use client"

import { useEffect, useState } from "react"
import { ChevronDown, LoaderCircle, WandSparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { StartupPitch } from "@/types/idea"

type PitchSectionProps = {
  pitch: StartupPitch | null
  isLoading: boolean
  onGenerate: () => void
}

export function PitchSection({
  pitch,
  isLoading,
  onGenerate,
}: PitchSectionProps) {
  const [open, setOpen] = useState(Boolean(pitch))

  useEffect(() => {
    if (pitch) {
      setOpen(true)
    }
  }, [pitch])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-[2rem] border border-border/70 bg-background/85 shadow-sm"
    >
      <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            AI Startup Pitch
          </div>
          <h3 className="font-display text-2xl leading-none text-foreground">
            Founder-ready narrative
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Expand the idea into a short pitch covering the problem, solution,
            market, and business model.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="rounded-full px-4"
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <WandSparkles />
            )}
            {pitch ? "Regenerate Pitch" : "Generate Pitch"}
          </Button>

          {pitch ? (
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" size="icon-sm">
                <ChevronDown
                  className={cn("transition-transform", open && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
          ) : null}
        </div>
      </div>

      <CollapsibleContent className="px-5 pb-5">
        <Separator className="mb-5" />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : pitch ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Problem", pitch.problem],
              ["Solution", pitch.solution],
              ["Market", pitch.market],
              ["Business Model", pitch.businessModel],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
              >
                <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  {label}
                </div>
                <p className="text-sm leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            Generate a pitch to turn the concept into a crisp startup story.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
