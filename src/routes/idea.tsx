import { useEffect, useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Link2, Share2 } from "lucide-react"

import { IdeaCard } from "@/components/idea-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  buildIdeaSharePath,
  buildIdeaShareUrl,
  decodeIdeaFromUrl,
  formatIdeaForClipboard,
  isIdeaSaved,
  saveIdea,
} from "@/lib/idea-storage"
import {
  generateMarketValidation,
  generatePitch,
  regenerateIdeaFacet,
} from "@/lib/gemini"
import type {
  IdeaFacet,
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

export const Route = createFileRoute("/idea")({
  validateSearch: (search: Record<string, unknown>) => ({
    data: typeof search.data === "string" ? search.data : "",
  }),
  head: () => ({
    meta: [
      {
        title: "Shared Idea | AI Startup Idea Lab",
      },
    ],
  }),
  component: SharedIdeaPage,
})

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function SharedIdeaPage() {
  const navigate = useNavigate()
  const { data } = Route.useSearch()
  const decodedPayload = useMemo(
    () => (data ? decodeIdeaFromUrl(data) : null),
    [data]
  )

  const [idea, setIdea] = useState<StartupIdea | null>(
    decodedPayload?.idea ?? null
  )
  const [pitch, setPitch] = useState<StartupPitch | null>(
    decodedPayload?.pitch ?? null
  )
  const [marketValidation, setMarketValidation] =
    useState<MarketValidation | null>(decodedPayload?.marketValidation ?? null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setIdea(decodedPayload?.idea ?? null)
    setPitch(decodedPayload?.pitch ?? null)
    setMarketValidation(decodedPayload?.marketValidation ?? null)
  }, [decodedPayload])

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
    pitchMutation.error ?? marketValidationMutation.error ?? facetMutation.error

  if (!decodedPayload || !idea || !currentPayload) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
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

        <Card className="rounded-[2rem] border border-dashed border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-4 px-6 py-8 text-center">
            <h1 className="font-display text-4xl leading-none">
              Shared idea unavailable
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
              This link does not contain a readable idea payload. Generate a new
              concept from the lab and create a fresh share link.
            </p>
            <div>
              <Button
                onClick={() => navigate({ to: "/" })}
                className="rounded-full"
              >
                Back to the lab
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
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

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-5 px-6 py-8 md:px-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Shared snapshot
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {idea.category}
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-5xl leading-none text-balance md:text-6xl">
                Review a shared startup idea
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This page is hydrated entirely from the URL. You can still save
                it locally, refresh the pitch, or generate a tighter market
                validation pass.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-4 px-6 py-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Share2 className="size-4" />
              Share behavior
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              The link contains encoded idea data, so teammates can open the
              exact concept without needing a backend database.
            </p>
            <Button variant="outline" className="rounded-full" asChild>
              <a href={currentSharePath}>
                <Link2 />
                Reload this snapshot
              </a>
            </Button>
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
        isSaved={isIdeaSaved(idea)}
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
          facetMutation.mutate({
            currentIdea: idea,
            facet,
          })
        }}
        onGeneratePitch={() => {
          pitchMutation.mutate(idea)
        }}
        onGenerateMarketValidation={() => {
          marketValidationMutation.mutate(idea)
        }}
        onCopy={async () => {
          try {
            await copyText(formatIdeaForClipboard(currentPayload))
            setFeedback("Idea copied to clipboard.")
          } catch {
            setFeedback("Clipboard access is unavailable in this browser.")
          }
        }}
        onCopyShareLink={async () => {
          try {
            await copyText(buildIdeaShareUrl(currentPayload))
            setFeedback("Share link copied.")
          } catch {
            setFeedback("Clipboard access is unavailable in this browser.")
          }
        }}
        onSave={() => {
          saveIdea(currentPayload)
          setFeedback("Idea saved locally.")
        }}
      />
    </main>
  )
}
