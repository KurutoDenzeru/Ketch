import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Bookmark,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react"

import { IdeaCard } from "@/components/idea-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { cn } from "@/lib/utils"
import type {
  IdeaCategory,
  IdeaFacet,
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import { ideaCategories } from "@/types/idea"

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
        <Skeleton className="h-36 w-full rounded-[1.5rem]" />
      </CardContent>
    </Card>
  )
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function IndexPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<IdeaCategory>("AI Tool")
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
    mutationFn: (nextCategory: IdeaCategory) =>
      generateIdea({ data: { category: nextCategory } }),
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
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <Tabs
        value="lab"
        onValueChange={(value) =>
          navigate({ to: value === "saved" ? "/saved" : "/" })
        }
        className="gap-4"
      >
        <TabsList variant="line" className="bg-transparent px-0">
          <TabsTrigger value="lab">Idea Lab</TabsTrigger>
          <TabsTrigger value="saved">Saved Ideas</TabsTrigger>
        </TabsList>
      </Tabs>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border border-border/70 bg-card/85 py-0 shadow-sm">
          <CardContent className="space-y-6 px-6 py-8 md:px-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                YC-style startup generator
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Gemini powered
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-none text-balance md:text-7xl">
                AI Startup Idea Lab
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Generate startup concepts, turn them into mini pitches, and run
                a lightweight market validation pass before you save or share
                them.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [
                  "Idea generation",
                  "Startup name, tagline, twist, and monetization",
                ],
                [
                  "Pitch builder",
                  "Problem, solution, market, and business model",
                ],
                ["Market validation", "Competition, risks, and likely users"],
              ].map(([label, text]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-border/70 bg-muted/35 p-4"
                >
                  <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                  </div>
                  <p className="text-sm leading-6 text-foreground">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/70 bg-[color-mix(in_oklch,var(--accent)_38%,white)] py-0 shadow-sm">
          <CardHeader className="gap-2 px-6 py-6">
            <CardTitle className="font-display text-3xl leading-none">
              Lab output
            </CardTitle>
            <p className="text-sm leading-6 text-foreground/75">
              Every generation returns structured data designed for product
              thinking, not novelty alone.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
              <div className="mb-3 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                JSON fields
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-foreground/80">
                {[
                  "name",
                  "tagline",
                  "description",
                  "audience",
                  "twist",
                  "monetization",
                  "validationScore",
                  "alternativeNames",
                ].map((field) => (
                  <div
                    key={field}
                    className="rounded-full bg-muted/50 px-3 py-2"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Bookmark className="size-4" />
                Saved idea library
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "idea" : "ideas"} ready
                to revisit.
              </p>
              <Button variant="outline" className="mt-4 rounded-full" asChild>
                <Link to="/saved">
                  Open saved ideas
                  <ChevronRight />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-5 px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                  <Target className="size-3.5" />
                  Startup Category
                </div>
                <div className="flex flex-wrap gap-2">
                  {ideaCategories.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-transform hover:-translate-y-0.5",
                        category === option
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={() => ideaMutation.mutate(category)}
                disabled={ideaMutation.isPending}
                className="rounded-full px-5"
              >
                {ideaMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <WandSparkles />
                )}
                Generate Idea
              </Button>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-2">
                <Sparkles className="size-4" />
                Generate one idea at a time with structured JSON output
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-2">
                <Bookmark className="size-4" />
                Save locally and revisit later
              </div>
            </div>
          </CardContent>
        </Card>

        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}

        {activeError ? (
          <p className="rounded-[1.25rem] border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {activeError.message}
          </p>
        ) : null}
      </section>

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
                Your next startup concept starts here
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
                Pick a category, generate an idea, then use the pitch and market
                validation tools to turn it into something that feels closer to
                a real product concept.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}
