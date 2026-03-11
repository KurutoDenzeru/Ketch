import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowUpRight,
  Bookmark,
  Compass,
  Lightbulb,
  LineChart,
  SearchCheck,
  Target,
} from "lucide-react"
import { toast } from "sonner"

import { IdeaBriefForm } from "@/components/idea-brief-form"
import { IdeaCard } from "@/components/idea-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildIdeaSharePath,
  buildIdeaShareUrl,
  formatIdeaForClipboard,
  getIdeaLabDraft,
  getSavedIdeas,
  isIdeaSaved,
  saveIdeaLabDraft,
  saveIdea,
} from "@/lib/idea-storage"
import {
  generateIdea,
  generateMarketValidation,
  generatePitch,
  regenerateIdea,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import type {
  IdeaBriefInput,
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "AI Startup Idea Lab",
      },
    ],
  }),
  component: IndexPage,
})

const initialBrief: IdeaBriefInput = {
  category: "AI Tool",
  concept: "",
  problem: "",
  audience: "",
  categoryFocus: "Agent workflow",
  featurePreferences: ["AI Automation", "Fast MVP"],
}

function IdeaCardSkeleton() {
  return (
    <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
      <CardHeader className="gap-4 border-b border-border/70 px-6 py-6">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        <Skeleton className="h-32 w-full rounded-[1.5rem]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
          <Skeleton className="h-28 w-full rounded-[1.5rem]" />
        </div>
        <Skeleton className="h-56 w-full rounded-[1.5rem]" />
      </CardContent>
    </Card>
  )
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function IndexPage() {
  const generatedIdeaRef = useRef<HTMLElement | null>(null)
  const [brief, setBrief] = useState<IdeaBriefInput>(
    () => getIdeaLabDraft()?.brief ?? initialBrief
  )
  const [idea, setIdea] = useState<StartupIdea | null>(
    () => getIdeaLabDraft()?.idea ?? null
  )
  const [pitch, setPitch] = useState<StartupPitch | null>(
    () => getIdeaLabDraft()?.pitch ?? null
  )
  const [marketValidation, setMarketValidation] = useState<MarketValidation | null>(
    () => getIdeaLabDraft()?.marketValidation ?? null
  )
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    setSavedCount(getSavedIdeas().length)
  }, [])

  useEffect(() => {
    saveIdeaLabDraft({
      brief,
      idea,
      pitch,
      marketValidation,
    })
  }, [brief, idea, pitch, marketValidation])

  const ideaMutation = useMutation({
    mutationFn: (input: IdeaBriefInput) => generateIdea({ data: input }),
    onMutate: () => {
      toast.loading("Generating idea...", {
        id: "generate-idea",
        description: "Ketch is building the concept and scoring it now.",
      })
    },
    onSuccess: (nextIdea) => {
      setIdea(nextIdea)
      setPitch(null)
      setMarketValidation(null)
      toast.success("Idea generated", {
        id: "generate-idea",
        description: `${nextIdea.name} is ready to review.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to generate idea", {
        id: "generate-idea",
        description: error.message,
      })
    },
  })

  useEffect(() => {
    if (!ideaMutation.isPending) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      generatedIdeaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [ideaMutation.isPending])

  const pitchMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generatePitch({ data: { idea: currentIdea } }),
    onSuccess: (nextPitch) => {
      setPitch(nextPitch)
      toast.success("Pitch ready", {
        description: "The founder-ready narrative has been updated.",
      })
    },
    onError: (error) => {
      toast.error("Failed to generate pitch", {
        description: error.message,
      })
    },
  })

  const marketValidationMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generateMarketValidation({ data: { idea: currentIdea } }),
    onSuccess: (nextValidation) => {
      setMarketValidation(nextValidation)
      toast.success("Validation ready", {
        description: "The latest market reality check is available below.",
      })
    },
    onError: (error) => {
      toast.error("Failed to run validation", {
        description: error.message,
      })
    },
  })

  const regenerateIdeaMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      regenerateIdea({ data: { idea: currentIdea } }),
    onMutate: () => {
      toast.loading("Regenerating idea...", {
        id: "regenerate-idea",
        description: "Ketch is rebuilding this concept from the current snapshot.",
      })
    },
    onSuccess: (nextIdea) => {
      setIdea(nextIdea)
      setPitch(null)
      setMarketValidation(null)
      toast.success("Idea regenerated", {
        id: "regenerate-idea",
        description: `${nextIdea.name} is the new working concept.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to regenerate idea", {
        id: "regenerate-idea",
        description: error.message,
      })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: currentIdea } }),
    onMutate: () => {
      toast.loading("Generating new titles...", {
        id: "generate-titles",
        description: "Ketch is generating a fresh set of names.",
      })
    },
    onSuccess: ({ name, alternativeNames }) => {
      setIdea((currentIdea) =>
        currentIdea
          ? {
              ...currentIdea,
              name,
              alternativeNames,
            }
          : currentIdea
      )
      toast.success("New titles ready", {
        id: "generate-titles",
        description: `${name} is now the lead title option.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to generate new titles", {
        id: "generate-titles",
        description: error.message,
      })
    },
  })

  const currentPayload: ShareableIdeaPayload | null = idea
    ? {
        idea,
        pitch,
        marketValidation,
      }
    : null

  const currentSharePath = currentPayload
    ? buildIdeaSharePath(currentPayload)
    : "/idea"

  const saved = idea ? isIdeaSaved(idea) : false

  async function handleCopyIdea() {
    if (!currentPayload) {
      return
    }

    try {
      await copyText(formatIdeaForClipboard(currentPayload))
      toast.success("Idea copied", {
        description: "The full startup idea summary is in your clipboard.",
      })
    } catch {
      toast.error("Clipboard unavailable", {
        description: "This browser blocked clipboard access.",
      })
    }
  }

  async function handleCopyShareLink() {
    if (!currentPayload) {
      return
    }

    try {
      await copyText(buildIdeaShareUrl(currentPayload))
      toast.success("Share link copied", {
        description: "You can paste the shared idea URL anywhere.",
      })
    } catch {
      toast.error("Clipboard unavailable", {
        description: "This browser blocked clipboard access.",
      })
    }
  }

  function handleSaveIdea() {
    if (!currentPayload) {
      return
    }

    saveIdea(currentPayload)
    setSavedCount(getSavedIdeas().length)
    toast.success(saved ? "Saved idea updated" : "Idea saved locally", {
      description: "Your startup idea is stored in this browser.",
    })
  }

  function handleGenerateIdea() {
    ideaMutation.mutate(brief)
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 md:gap-14 md:px-6 md:py-10">
      <section className="space-y-10 px-2 py-6 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className="rounded-full px-4 py-1.5">
            Founder-first evaluator
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1.5">
            Gemini powered
          </Badge>
        </div>

        <div className="mx-auto max-w-4xl space-y-5 text-center">
          <h1 className="font-display text-5xl leading-[0.92] text-balance md:text-7xl lg:text-8xl">
            AI Startup
            <span className="block text-primary italic">Idea Lab</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            Turn a rough founder brief into a startup concept with opportunity
            scoring, market timing analysis, proof signals, and an execution
            roadmap that feels closer to an investor memo than a random prompt.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              value: "14",
              label: "Startup lanes",
              detail: "Guided categories to explore",
            },
            {
              value: "8",
              label: "Analysis blocks",
              detail: "Signals, charts, and fit",
            },
            {
              value: "1",
              label: "Detailed plan",
              detail: "Launch path with phases",
            },
            {
              value: String(savedCount).padStart(2, "0"),
              label: "Saved ideas",
              detail: "Ready to revisit anytime",
            },
          ].map(({ value, label, detail }) => (
            <div
              key={label}
              className="rounded-[1.75rem] border border-border/70 bg-background/70 px-5 py-5 text-center"
            >
              <div className="font-display text-4xl leading-none md:text-5xl">
                {value}
              </div>
              <div className="mt-2 text-[11px] font-semibold tracking-[0.26em] text-muted-foreground uppercase">
                {label}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <IdeaBriefForm
        brief={brief}
        onChange={(patch) =>
          setBrief((currentBrief) => ({
            ...currentBrief,
            ...patch,
          }))
        }
        onSubmit={handleGenerateIdea}
        isLoading={ideaMutation.isPending}
      />

      <section className="grid gap-4 md:grid-cols-3 md:gap-5">
        {[
          {
            icon: Lightbulb,
            label: "Idea framing",
            text: "Start from your own founder angle so the lab generates something anchored in a real problem instead of generic startup filler.",
          },
          {
            icon: Target,
            label: "Opportunity scoring",
            text: "Review timing, defensibility, demand signals, and business fit through concise scoring cards and validation cues.",
          },
          {
            icon: Compass,
            label: "Execution mapping",
            text: "Get phased rollout notes, market gap analysis, keyword trends, and a fuller plan for what to build first.",
          },
        ].map(({ icon: ItemIcon, label, text }) => (
          <Card
            key={label}
            className="rounded-[1.75rem] border border-border/70 bg-card/80 py-0 shadow-sm"
          >
            <CardContent className="space-y-4 px-5 py-6">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                <ItemIcon className="size-3.5" />
                {label}
              </div>
              <p className="text-sm leading-7 text-foreground/90">{text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border border-border/70 bg-card/80 py-0 shadow-sm">
          <CardContent className="space-y-5 px-6 py-6 md:px-7">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Analysis blocks
              </p>
              <h2 className="font-display text-3xl leading-none">
                What the lab evaluates
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Why now?",
                "Proof & signals",
                "The market gap",
                "Execution plan",
                "Trend chart",
                "Keyword signals",
                "Framework fit",
                "Detailed plan",
              ].map((field) => (
                <div
                  key={field}
                  className="rounded-[1.25rem] border border-border/70 bg-background/65 px-4 py-3 text-sm"
                >
                  {field}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/70 bg-card/80 py-0 shadow-sm">
          <CardContent className="space-y-5 px-6 py-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Saved library
              </p>
              <h2 className="font-display text-3xl leading-none">
                Keep the strongest ideas close
              </h2>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Bookmark className="size-4" />
                Saved idea library
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "idea" : "ideas"} ready
                to revisit, compare, or share.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: SearchCheck,
                  label: "Proof review",
                  text: "Compare timing and signal quality across concepts.",
                },
                {
                  icon: LineChart,
                  label: "Validation memory",
                  text: "Keep generated analysis nearby while refining the brief.",
                },
              ].map(({ icon: ItemIcon, label, text }) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <ItemIcon className="size-4" />
                    {label}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/saved"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Open saved ideas
              <ArrowUpRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section
        ref={generatedIdeaRef}
        className="scroll-mt-28 space-y-6 pt-2 md:scroll-mt-32 md:pt-4"
      >
        {ideaMutation.isPending ? (
          <IdeaCardSkeleton />
        ) : idea && currentPayload ? (
          <IdeaCard
            idea={idea}
            pitch={pitch}
            marketValidation={marketValidation}
            isPitchLoading={pitchMutation.isPending}
            isMarketValidationLoading={marketValidationMutation.isPending}
            isRegeneratingIdea={regenerateIdeaMutation.isPending}
            isRegeneratingTitles={regenerateTitlesMutation.isPending}
            isSaved={saved}
            sharePath={currentSharePath}
            onSelectAlternativeName={(name) => {
              setIdea((currentIdea) =>
                currentIdea
                  ? {
                      ...currentIdea,
                      name,
                    }
                  : currentIdea
              )
              toast.success("Startup name swapped", {
                description: `${name} is now the active concept name.`,
              })
            }}
            onRegenerateIdea={() => {
              if (idea) {
                regenerateIdeaMutation.mutate(idea)
              }
            }}
            onRegenerateTitles={() => {
              if (idea) {
                regenerateTitlesMutation.mutate(idea)
              }
            }}
            onGeneratePitch={() => {
              if (idea) {
                pitchMutation.mutate(idea)
              }
            }}
            onGenerateMarketValidation={() => {
              if (idea) {
                marketValidationMutation.mutate(idea)
              }
            }}
            onCopy={handleCopyIdea}
            onCopyShareLink={handleCopyShareLink}
            onSave={handleSaveIdea}
          />
        ) : (
          <Card className="rounded-[2rem] border border-dashed border-border/70 bg-card/70 py-0 shadow-sm">
            <CardContent className="space-y-4 px-6 py-8 text-center">
              <h2 className="font-display text-3xl leading-none">
                Describe the founder context, then let the lab evaluate it
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
                Enter the problem, audience, or any advantage you have. The
                output will be more grounded than a generic startup generator
                and closer to a portfolio-ready product memo.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}
