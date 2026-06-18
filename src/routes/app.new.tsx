import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Compass, Lightbulb, Target, WandSparkles } from "lucide-react"
import { toast } from "sonner"

import type {
  IdeaBriefInput,
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import { IdeaBriefForm } from "@/components/idea-brief-form"
import { IdeaCard } from "@/components/idea-card"
import { EmptyState } from "@/components/empty-state"
import { ScoreRing } from "@/components/score-ring"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { buildSeoHead } from "@/lib/seo"
import {
  buildSharedIdeaUrl,
  clearIdeaLabDraft,
  formatIdeaAsAgentPrompt,
  formatIdeaAsMarkdown,
  formatIdeaForClipboard,
  getIdeaLabDraft,
  isIdeaSaved,
  removeIdeaByIdea,
  saveIdea,
  saveIdeaLabDraft,
} from "@/lib/idea-storage"
import { recordActivity } from "@/lib/activity-log"
import { recordSharedLink } from "@/lib/shared-links"
import {
  generateIdea,
  generateMarketValidation,
  generatePitch,
  getGenerationRateLimitStatus,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import { createSharedIdeaLink } from "@/lib/shared-idea-store"

const generationRateLimitQueryKey = ["generation-rate-limit"] as const

const initialBrief: IdeaBriefInput = {
  category: "AI Tool",
  concept: "",
  problem: "",
  audience: "",
  categoryFocus: "Agent workflow",
  featurePreferences: ["AI Automation", "Fast MVP"],
}

export const Route = createFileRoute("/app/new")({
  head: () =>
    buildSeoHead({
      path: "/app/new",
      title: "Idea Lab | Ketch",
      description: "Generate, score, and share startup ideas with the Ketch lab.",
      keywords: "startup idea generator, AI lab, founder brief",
      imageAlt: "Ketch Idea Lab",
      robots: "noindex, follow",
    }),
  component: NewIdeaPage,
})

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function NewIdeaPage() {
  const queryClient = useQueryClient()
  const resultRef = useRef<HTMLDivElement | null>(null)
  const [brief, setBrief] = useState<IdeaBriefInput>(initialBrief)
  const [idea, setIdea] = useState<StartupIdea | null>(null)
  const [pitch, setPitch] = useState<StartupPitch | null>(null)
  const [marketValidation, setMarketValidation] = useState<MarketValidation | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copiedFormat, setCopiedFormat] = useState<
    "text" | "markdown" | "agent-prompt" | "link" | null
  >(null)

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
    const draft = getIdeaLabDraft()
    if (draft) {
      setBrief(draft.brief)
      if (draft.idea) setIdea(draft.idea)
      if (draft.pitch) setPitch(draft.pitch)
      if (draft.marketValidation) setMarketValidation(draft.marketValidation)
    }
  }, [])

  useEffect(() => {
    saveIdeaLabDraft({ brief, idea, pitch, marketValidation })
  }, [brief, idea, pitch, marketValidation])

  const ideaMutation = useMutation({
    mutationFn: (input: IdeaBriefInput) => generateIdea({ data: input }),
    onMutate: () => {
      toast.loading("Generating idea…", {
        id: "generate-idea",
        description: "Ketch is building the concept and scoring it now.",
      })
    },
    onSuccess: (nextIdea) => {
      setIdea(nextIdea)
      setPitch(null)
      setMarketValidation(null)
      void refreshGenerationRateLimit()
      recordActivity("idea_generated", { idea: nextIdea })
      toast.success("Idea generated", {
        id: "generate-idea",
        description: `${nextIdea.name} is ready to review.`,
      })
    },
    onError: (error) => {
      void refreshGenerationRateLimit()
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
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
    return () => window.cancelAnimationFrame(frame)
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
      toast.error("Failed to generate pitch", { description: error.message })
    },
  })

  const marketValidationMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      generateMarketValidation({ data: { idea: currentIdea } }),
    onSuccess: (next) => {
      setMarketValidation(next)
      toast.success("Validation ready", {
        description: "The market reality check is available in the Validation tab.",
      })
    },
    onError: (error) => {
      toast.error("Failed to run validation", { description: error.message })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (currentIdea: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: currentIdea } }),
    onMutate: () =>
      toast.loading("Generating new titles…", {
        id: "generate-titles",
        description: "Ketch is generating a fresh set of names.",
      }),
    onSuccess: ({ alternativeNames }) => {
      setIdea((current) =>
        current ? { ...current, alternativeNames } : current
      )
      void refreshGenerationRateLimit()
      toast.success("New titles ready", {
        id: "generate-titles",
        description: "A fresh set of title options is ready to review.",
      })
    },
    onError: (error) => {
      void refreshGenerationRateLimit()
      toast.error("Failed to generate new titles", {
        id: "generate-titles",
        description: error.message,
      })
    },
  })

  const currentPayload: ShareableIdeaPayload | null = idea
    ? { idea, pitch, marketValidation }
    : null

  const isSaved = idea ? isIdeaSaved(idea) : false

  async function createShareLink(payload: ShareableIdeaPayload) {
    const sharedIdea = await createSharedIdeaLink({ data: { payload } })
    recordSharedLink(sharedIdea.shareId, sharedIdea.payload)
    return {
      shareId: sharedIdea.shareId,
      shareUrl: buildSharedIdeaUrl(sharedIdea.shareId),
    }
  }

  function setTemporaryCopyState(
    format: "text" | "markdown" | "agent-prompt" | "link"
  ) {
    setCopiedFormat(format)
    window.setTimeout(() => setCopiedFormat(null), 2000)
  }

  function handleCopy(format: "text" | "markdown" | "agent-prompt" | "link", value: string) {
    return copyText(value)
      .then(() => {
        setTemporaryCopyState(format)
      })
      .catch(() => {
        toast.error("Clipboard unavailable", {
          description: "This browser blocked clipboard access.",
        })
      })
  }

  function handleCopyText() {
    if (!currentPayload) return
    return handleCopy("text", formatIdeaForClipboard(currentPayload))
  }
  function handleCopyMarkdown() {
    if (!currentPayload) return
    return handleCopy("markdown", formatIdeaAsMarkdown(currentPayload))
  }
  function handleCopyAgentPrompt() {
    if (!currentPayload) return
    return handleCopy("agent-prompt", formatIdeaAsAgentPrompt(currentPayload))
  }

  async function handleCopyShareLink() {
    if (!currentPayload) return
    try {
      setIsSharing(true)
      const { shareUrl } = await createShareLink(currentPayload)
      await copyText(shareUrl)
      setTemporaryCopyState("link")
      recordActivity("link_shared", { idea: currentPayload.idea, shareId: shareUrl })
      toast.success("Share link copied", {
        description: "You can paste the shared idea URL anywhere.",
      })
    } catch {
      toast.error("Clipboard unavailable", {
        description: "This browser blocked clipboard access.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  async function handleOpenSharedView() {
    if (!currentPayload) return
    try {
      setIsSharing(true)
      const { shareUrl } = await createShareLink(currentPayload)
      recordActivity("link_shared", { idea: currentPayload.idea, shareId: shareUrl })
      window.location.assign(shareUrl)
    } catch {
      toast.error("Unable to open shared view", {
        description: "Ketch could not create a shared snapshot right now.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  function handleSaveIdea() {
    if (!currentPayload) return
    const savedEntry = saveIdea(currentPayload)
    recordActivity("idea_saved", { idea: currentPayload.idea, ideaId: savedEntry.id })
  }

  function handleRemoveIdea() {
    if (!idea) return
    removeIdeaByIdea(idea)
    recordActivity("idea_removed", { idea })
    setIdea(null)
    setPitch(null)
    setMarketValidation(null)
    clearIdeaLabDraft()
    toast.success("Idea removed", {
      description: "The current working concept has been cleared from the lab.",
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-3">
        <SectionEyebrow icon={WandSparkles}>Idea Lab</SectionEyebrow>
        <h1 className="font-display text-4xl leading-[1.05] text-balance sm:text-5xl">
          Describe the founder context.{" "}
          <span className="italic text-primary">Get the memo.</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          A short brief is enough. Ketch handles the structure, scoring, and the
          shareable report.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <IdeaBriefForm
            brief={brief}
            onChange={(patch) =>
              setBrief((current) => ({ ...current, ...patch }))
            }
            onSubmit={() => ideaMutation.mutate(brief)}
            isLoading={ideaMutation.isPending}
            generationRateLimit={generationRateLimit}
          />
        </aside>

        <section ref={resultRef} className="scroll-mt-28 space-y-4">
          {ideaMutation.isPending ? (
            <ResultSkeleton />
          ) : idea && currentPayload ? (
            <IdeaCard
              idea={idea}
              pitch={pitch}
              marketValidation={marketValidation}
              isPitchLoading={pitchMutation.isPending}
              isMarketValidationLoading={marketValidationMutation.isPending}
              isRegeneratingTitles={regenerateTitlesMutation.isPending}
              isSharing={isSharing}
              isSaved={isSaved}
              copiedIdeaFormat={
                copiedFormat === "text" ||
                copiedFormat === "markdown" ||
                copiedFormat === "agent-prompt"
                  ? copiedFormat
                  : null
              }
              isShareLinkCopied={copiedFormat === "link"}
              generationRateLimit={generationRateLimit}
              onSelectAlternativeName={(name) => {
                setIdea((current) => (current ? { ...current, name } : current))
                toast.success("Startup name swapped", {
                  description: `${name} is now the active concept name.`,
                })
              }}
              onRegenerateTitles={() => regenerateTitlesMutation.mutate(idea)}
              onGeneratePitch={() => pitchMutation.mutate(idea)}
              onGenerateMarketValidation={() => marketValidationMutation.mutate(idea)}
              onCopyText={handleCopyText}
              onCopyMarkdown={handleCopyMarkdown}
              onCopyAgentPrompt={handleCopyAgentPrompt}
              onCopyShareLink={handleCopyShareLink}
              onOpenSharedView={handleOpenSharedView}
              onSave={handleSaveIdea}
              onRemove={() => {
                if (
                  window.confirm(
                    "Remove the current working concept? Saved snapshots are kept."
                  )
                ) {
                  handleRemoveIdea()
                }
              }}
            />
          ) : (
            <ResultEmpty />
          )}
        </section>
      </div>
    </div>
  )
}

function ResultSkeleton() {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="rounded-3xl border border-border/60 bg-muted/30 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="size-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  )
}

function ResultEmpty() {
  return (
    <EmptyState
      icon={<ScoreRing value={0} size={120} strokeWidth={10} tone="muted" />}
      title="Your idea report appears here."
      description="Fill in the brief on the left, then press Generate. Ketch will return a full memo with opportunity scoring, market timing, shareable reports, and a phased execution plan."
      action={
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1">
            <Lightbulb className="size-3.5 text-primary" />
            Two minutes for a complete memo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1">
            <Target className="size-3.5 text-primary" />
            Tuned to solo founders
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1">
            <Compass className="size-3.5 text-primary" />
            Local-first, no signup
          </span>
        </div>
      }
    />
  )
}
