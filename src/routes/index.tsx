import { useEffect, useState } from "react"
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

import { IdeaBriefForm } from "@/components/idea-brief-form"
import { IdeaCard } from "@/components/idea-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildIdeaSharePath,
  buildIdeaShareUrl,
  formatIdeaForClipboard,
  getSavedIdeas,
  isIdeaSaved,
  saveIdea,
} from "@/lib/idea-storage"
import {
  generateIdea,
  generateMarketValidation,
  generatePitch,
  regenerateIdeaFacet,
} from "@/lib/gemini"
import type {
  IdeaBriefInput,
  IdeaFacet,
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
  const [brief, setBrief] = useState<IdeaBriefInput>(initialBrief)
  const [idea, setIdea] = useState<StartupIdea | null>(null)
  const [pitch, setPitch] = useState<StartupPitch | null>(null)
  const [marketValidation, setMarketValidation] =
    useState<MarketValidation | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setSavedCount(getSavedIdeas().length)
  }, [])

  const ideaMutation = useMutation({
    mutationFn: (input: IdeaBriefInput) => generateIdea({ data: input }),
    onSuccess: (nextIdea) => {
      setIdea(nextIdea)
      setPitch(null)
      setMarketValidation(null)
      setFeedback(`Generated ${nextIdea.name}.`)
    },
  })

  const pitchMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generatePitch({ data: { idea: currentIdea } }),
    onSuccess: (nextPitch) => {
      setPitch(nextPitch)
      setFeedback("Pitch ready.")
    },
  })

  const marketValidationMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generateMarketValidation({ data: { idea: currentIdea } }),
    onSuccess: (nextValidation) => {
      setMarketValidation(nextValidation)
      setFeedback("Market validation ready.")
    },
  })

  const facetMutation = useMutation({
    mutationFn: ({
      currentIdea,
      facet,
    }: {
      currentIdea: StartupIdea
      facet: IdeaFacet
    }) => regenerateIdeaFacet({ data: { idea: currentIdea, facet } }),
    onSuccess: ({ facet, value }) => {
      setIdea((currentIdea) =>
        currentIdea
          ? {
              ...currentIdea,
              [facet]: value,
            }
          : currentIdea
      )
      setFeedback(`${facet === "tagline" ? "Tagline" : "Twist"} refreshed.`)
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

  const activeError =
    ideaMutation.error ??
    pitchMutation.error ??
    marketValidationMutation.error ??
    facetMutation.error

  const saved = idea ? isIdeaSaved(idea) : false

  async function handleCopyIdea() {
    if (!currentPayload) {
      return
    }

    try {
      await copyText(formatIdeaForClipboard(currentPayload))
      setFeedback("Idea copied to clipboard.")
    } catch {
      setFeedback("Clipboard access is unavailable in this browser.")
    }
  }

  async function handleCopyShareLink() {
    if (!currentPayload) {
      return
    }

    try {
      await copyText(buildIdeaShareUrl(currentPayload))
      setFeedback("Share link copied.")
    } catch {
      setFeedback("Clipboard access is unavailable in this browser.")
    }
  }

  function handleSaveIdea() {
    if (!currentPayload) {
      return
    }

    saveIdea(currentPayload)
    setSavedCount(getSavedIdeas().length)
    setFeedback(saved ? "Saved idea updated." : "Idea saved locally.")
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="space-y-8 rounded-[2.5rem] border border-border/70 bg-card/85 px-6 py-10 shadow-sm md:px-10 md:py-14">
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

        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          {[
            "Why now",
            "Proof & signals",
            "Market gap",
            "Execution plan",
            "Trend chart",
            "Keyword cues",
            "Framework fit",
            "Detailed plan",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-border/70 bg-background/75 px-4 py-2"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              value: "3",
              label: "Founder inputs",
              detail: "Concept, audience, problem",
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
        onSubmit={() => ideaMutation.mutate(brief)}
        isLoading={ideaMutation.isPending}
      />

      <section className="grid gap-4 md:grid-cols-3">
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

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
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

      {feedback ? (
        <p className="text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      {activeError ? (
        <p className="rounded-[1.25rem] border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {activeError.message}
        </p>
      ) : null}

      <section className="space-y-6">
        {ideaMutation.isPending ? (
          <IdeaCardSkeleton />
        ) : idea && currentPayload ? (
          <IdeaCard
            idea={idea}
            pitch={pitch}
            marketValidation={marketValidation}
            isPitchLoading={pitchMutation.isPending}
            isMarketValidationLoading={marketValidationMutation.isPending}
            refreshingFacet={
              facetMutation.isPending
                ? (facetMutation.variables?.facet ?? null)
                : null
            }
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
              setFeedback("Active startup name updated.")
            }}
            onRefreshFacet={(facet) => {
              if (!idea) {
                return
              }
              facetMutation.mutate({
                currentIdea: idea,
                facet,
              })
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
