import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CalendarDays, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { IdeaCard } from "@/components/idea-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildIdeaSharePath,
  buildIdeaShareUrl,
  formatIdeaForClipboard,
  getSavedIdeas,
  removeIdea,
  updateSavedIdea,
} from "@/lib/idea-storage"
import {
  generateMarketValidation,
  generatePitch,
  regenerateIdea,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import type {
  MarketValidation,
  SavedIdea,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      {
        title: "Saved Ideas | AI Startup Idea Lab",
      },
    ],
  }),
  component: SavedIdeasPage,
})

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

type SavedIdeaCardProps = {
  savedIdea: SavedIdea
  onRemove: (id: string) => void
  onUpdate: (nextIdea: SavedIdea) => void
}

function SavedIdeaCard({ savedIdea, onRemove, onUpdate }: SavedIdeaCardProps) {
  const [idea, setIdea] = useState<StartupIdea>(savedIdea.idea)
  const [pitch, setPitch] = useState<StartupPitch | null>(savedIdea.pitch ?? null)
  const [marketValidation, setMarketValidation] = useState<MarketValidation | null>(
    savedIdea.marketValidation ?? null
  )

  useEffect(() => {
    setIdea(savedIdea.idea)
    setPitch(savedIdea.pitch ?? null)
    setMarketValidation(savedIdea.marketValidation ?? null)
  }, [savedIdea])

  function persistPayload(payload: ShareableIdeaPayload) {
    const nextIdea = updateSavedIdea(savedIdea.id, payload)
    onUpdate(nextIdea)
    return nextIdea
  }

  const pitchMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generatePitch({ data: { idea: currentIdea } }),
    onSuccess: (nextPitch) => {
      setPitch(nextPitch)
      persistPayload({
        idea,
        pitch: nextPitch,
        marketValidation,
      })
      toast.success("Pitch ready", {
        description: "The saved idea now includes the refreshed pitch.",
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
      persistPayload({
        idea,
        pitch,
        marketValidation: nextValidation,
      })
      toast.success("Validation ready", {
        description: "The saved idea now includes refreshed market validation.",
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
        id: `regenerate-saved-idea-${savedIdea.id}`,
        description: "Ketch is rebuilding this saved snapshot.",
      })
    },
    onSuccess: (nextIdea) => {
      setIdea(nextIdea)
      setPitch(null)
      setMarketValidation(null)
      persistPayload({
        idea: nextIdea,
        pitch: null,
        marketValidation: null,
      })
      toast.success("Idea regenerated", {
        id: `regenerate-saved-idea-${savedIdea.id}`,
        description: `${nextIdea.name} is the new saved concept.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to regenerate idea", {
        id: `regenerate-saved-idea-${savedIdea.id}`,
        description: error.message,
      })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: currentIdea } }),
    onMutate: () => {
      toast.loading("Generating new titles...", {
        id: `generate-saved-titles-${savedIdea.id}`,
        description: "Ketch is generating a fresh set of names.",
      })
    },
    onSuccess: ({ name, alternativeNames }) => {
      const nextIdea = {
        ...idea,
        name,
        alternativeNames,
      }

      setIdea(nextIdea)
      persistPayload({
        idea: nextIdea,
        pitch,
        marketValidation,
      })
      toast.success("New titles ready", {
        id: `generate-saved-titles-${savedIdea.id}`,
        description: `${name} is now the lead saved title option.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to generate new titles", {
        id: `generate-saved-titles-${savedIdea.id}`,
        description: error.message,
      })
    },
  })

  const currentPayload: ShareableIdeaPayload = {
    idea,
    pitch,
    marketValidation,
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Saved snapshot
          </Badge>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {new Date(savedIdea.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => regenerateIdeaMutation.mutate(idea)}
            disabled={regenerateIdeaMutation.isPending}
            className="rounded-full"
          >
            {regenerateIdeaMutation.isPending ? (
              <span className="inline-flex items-center">
                <Sparkles className="animate-pulse" />
              </span>
            ) : (
              <Sparkles />
            )}
            Regenerate idea
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove saved idea?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the saved snapshot from local storage, including its
                  generated pitch and validation data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    onRemove(savedIdea.id)
                    toast.success("Saved idea removed", {
                      description: "The local copy has been deleted from this browser.",
                    })
                  }}
                >
                  Remove idea
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <IdeaCard
        idea={idea}
        pitch={pitch}
        marketValidation={marketValidation}
        isPitchLoading={pitchMutation.isPending}
        isMarketValidationLoading={marketValidationMutation.isPending}
        isRegeneratingIdea={regenerateIdeaMutation.isPending}
        isRegeneratingTitles={regenerateTitlesMutation.isPending}
        isSaved
        sharePath={buildIdeaSharePath(currentPayload)}
        onSelectAlternativeName={(name) => {
          const nextIdea = {
            ...idea,
            name,
          }

          setIdea(nextIdea)
          persistPayload({
            idea: nextIdea,
            pitch,
            marketValidation,
          })
          toast.success("Startup name swapped", {
            description: `${name} is now the active saved idea name.`,
          })
        }}
        onRegenerateIdea={() => {
          regenerateIdeaMutation.mutate(idea)
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
              description: "The full startup idea summary is in your clipboard.",
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
          persistPayload(currentPayload)
          toast.success("Saved idea updated", {
            description: "Changes to this saved idea were written locally.",
          })
        }}
      />
    </section>
  )
}

function SavedIdeasPage() {
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState<SavedIdea[]>([])

  useEffect(() => {
    setIdeas(getSavedIdeas())
  }, [])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-5 px-6 py-8 md:px-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Local storage archive
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {ideas.length} saved {ideas.length === 1 ? "idea" : "ideas"}
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-5xl leading-none text-balance md:text-6xl">
                Saved ideas
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Every saved entry keeps the full founder memo: charts, scoring,
                pitch, validation, and the detailed execution plan from the lab.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/70 py-0 shadow-sm">
          <CardHeader className="gap-2 px-6 py-6">
            <CardTitle className="font-display text-3xl leading-none">
              What persists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-muted-foreground">
            <p>Startup idea details stay in localStorage between sessions.</p>
            <p>Generated pitches, charts, and AI market validation persist too.</p>
            <p>You can reopen, refresh, rename, share, or remove each saved idea here.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        {ideas.length === 0 ? (
          <Card className="rounded-[2rem] border border-dashed border-border/70 py-0 shadow-sm">
            <CardContent className="space-y-4 px-6 py-8 text-center">
              <h2 className="font-display text-3xl leading-none">
                No saved ideas yet
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
                Generate an idea from the lab and save it here when it feels
                worth keeping.
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
        ) : (
          ideas.map((savedIdea) => (
            <SavedIdeaCard
              key={savedIdea.id}
              savedIdea={savedIdea}
              onRemove={(id) => {
                const nextIdeas = removeIdea(id)
                setIdeas(nextIdeas)
              }}
              onUpdate={(nextIdea) => {
                setIdeas((currentIdeas) =>
                  currentIdeas.map((idea) =>
                    idea.id === nextIdea.id ? nextIdea : idea
                  )
                )
              }}
            />
          ))
        )}
      </section>
    </main>
  )
}
