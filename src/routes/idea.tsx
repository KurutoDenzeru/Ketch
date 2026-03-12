import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Link2, Share2 } from "lucide-react"
import { toast } from "sonner"

import { IdeaCard } from "@/components/idea-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  getGenerationRateLimitStatus,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import type {
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

const generationRateLimitQueryKey = ["generation-rate-limit"] as const

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
  const queryClient = useQueryClient()
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
  const generationRateLimitQuery = useQuery({
    queryKey: generationRateLimitQueryKey,
    queryFn: () => getGenerationRateLimitStatus(),
  })
  const generationRateLimit = generationRateLimitQuery.data ?? null

  function refreshGenerationRateLimit() {
    return queryClient.invalidateQueries({
      queryKey: generationRateLimitQueryKey,
    })
  }

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
      toast.success("Pitch ready", {
        description: "The founder-ready narrative has been refreshed.",
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
        description: "The shared snapshot now includes fresh validation.",
      })
    },
    onError: (error) => {
      toast.error("Failed to run validation", {
        description: error.message,
      })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: currentIdea } }),
    onMutate: () => {
      toast.loading("Generating new titles...", {
        id: "generate-shared-titles",
        description: "Ketch is generating a fresh set of names.",
      })
    },
    onSuccess: ({ alternativeNames }) => {
      setIdea((currentIdea) =>
        currentIdea
          ? {
              ...currentIdea,
              alternativeNames,
            }
          : currentIdea
      )
      void refreshGenerationRateLimit()
      toast.success("New titles ready", {
        id: "generate-shared-titles",
        description: "A fresh set of title options is ready to review.",
      })
    },
    onError: (error) => {
      void refreshGenerationRateLimit()
      toast.error("Failed to generate new titles", {
        id: "generate-shared-titles",
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

  if (!decodedPayload || !idea || !currentPayload) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
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
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
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

      <IdeaCard
        idea={idea}
        pitch={pitch}
        marketValidation={marketValidation}
        isPitchLoading={pitchMutation.isPending}
        isMarketValidationLoading={marketValidationMutation.isPending}
        isRegeneratingTitles={regenerateTitlesMutation.isPending}
        generationRateLimit={generationRateLimit}
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
          toast.success("Startup name swapped", {
            description: `${name} is now the active concept name.`,
          })
        }}
        onRegenerateTitles={() => {
          regenerateTitlesMutation.mutate(idea)
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
            toast.success("Idea copied", {
              description:
                "The full startup idea summary is in your clipboard.",
            })
          } catch {
            toast.error("Clipboard unavailable", {
              description: "This browser blocked clipboard access.",
            })
          }
        }}
        onCopyShareLink={async () => {
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
        }}
        onSave={() => {
          saveIdea(currentPayload)
          toast.success("Idea saved locally", {
            description: "Your startup idea is stored in this browser.",
          })
        }}
      />
    </main>
  )
}
