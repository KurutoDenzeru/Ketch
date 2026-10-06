import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { cn } from "cn"
import { Gauge, Lightbulb, Sparkles, Target, WandSparkles } from "lucide-react"
import { toast } from "sonner"

import type {
  IdeaBriefInput,
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import type { GenerationRateLimitStatus } from "@/types/rate-limit"

import { AppCard, AppMasthead, AppPage } from "@/components/app/app-chrome"
import { IdeaBriefForm } from "@/components/idea-brief-form"
import { IdeaCard } from "@/components/idea-card"
import { ArtField } from "@/components/art-field"
import { ScoreRing } from "@/components/score-ring"
import { Faq } from "@/components/faq"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { buildSeoHead } from "@/lib/seo"
import {
  buildIdeaShareUrl,
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
  const [copiedFormat, setCopiedFormat] = useState<
    "text" | "markdown" | "agent-prompt" | "link" | null
  >(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      setErrorMessage(null)
      toast.loading("Generating idea…", {
        id: "generate-idea",
        description: "Ketch is building the concept and scoring it now.",
      })
    },
    onSuccess: (nextIdea) => {
      setErrorMessage(null)
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
      toast.dismiss("generate-idea")
      setErrorMessage(error.message)
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

  function setTemporaryCopyState(
    format: "text" | "markdown" | "agent-prompt" | "link"
  ) {
    setCopiedFormat(format)
    window.setTimeout(() => setCopiedFormat(null), 2000)
  }

  function handleCopy(
    format: "text" | "markdown" | "agent-prompt" | "link",
    value: string
  ) {
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

  function handleCopyShareLink() {
    if (!currentPayload) return
    const shareUrl = buildIdeaShareUrl(currentPayload)
    copyText(shareUrl)
      .then(() => {
        setTemporaryCopyState("link")
        recordSharedLink(shareUrl, currentPayload)
        recordActivity("link_shared", { idea: currentPayload.idea, shareId: shareUrl })
        toast.success("Share link copied", {
          description: "You can paste the shared idea URL anywhere.",
        })
      })
      .catch(() => {
        toast.error("Clipboard unavailable", {
          description: "This browser blocked clipboard access.",
        })
      })
  }

  function handleOpenSharedView() {
    if (!currentPayload) return
    const shareUrl = buildIdeaShareUrl(currentPayload)
    recordSharedLink(shareUrl, currentPayload)
    recordActivity("link_shared", { idea: currentPayload.idea, shareId: shareUrl })
    window.location.assign(shareUrl)
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
    setErrorMessage(null)
    toast.success("Idea removed", {
      description: "The current working concept has been cleared from the lab.",
    })
  }

  return (
    <AppPage>
      <AppMasthead
        eyebrow="Idea Lab"
        title="Describe the founder context."
        accent="Get the memo."
        description="A short brief is enough. Ketch handles the structure, scoring, and the shareable report."
        meta={<GenerationReadout rateLimit={generationRateLimit} pending={ideaMutation.isPending} />}
        art="draft"
      />

      <div className="mt-8 space-y-8 md:mt-12">
        <aside>
          <IdeaBriefForm
            brief={brief}
            onChange={(patch) =>
              setBrief((current) => ({ ...current, ...patch }))
            }
            onSubmit={() => ideaMutation.mutate(brief)}
            isLoading={ideaMutation.isPending}
            generationRateLimit={generationRateLimit}
            locked={Boolean(idea)}
            errorMessage={errorMessage}
          />
        </aside>

        <section ref={resultRef} className="scroll-mt-28 sm:scroll-mt-32">
          <ScrollReveal>
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
                isSharing={false}
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
          </ScrollReveal>
        </section>
      </div>

      <div className="mt-16 md:mt-20">
        <Faq />
      </div>
    </AppPage>
  )
}

function ResultSkeleton() {
  return (
    <AppCard className="space-y-6">
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
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
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
      <p
        className="flex items-center gap-2 text-xs text-muted-foreground"
        suppressHydrationWarning
      >
        <WandSparkles className="size-3.5 animate-pulse text-primary" />
        Drafting the concept, scoring the opportunity, and pulling market signals.
      </p>
    </AppCard>
  )
}

function ResultEmpty() {
  return (
    <div className="flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-20 text-center shadow-sm backdrop-blur md:px-10">
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-12 -z-10 opacity-60"
        >
          <ArtField slug="brief" className="size-full" />
        </div>
        <div className="text-muted-foreground/50">
          <ScoreRing value={0} size={140} strokeWidth={10} tone="muted" />
        </div>
      </div>
      <div className="max-w-xl space-y-3">
        <h2 className="font-display text-3xl leading-tight text-balance md:text-4xl">
          Nothing here yet. That is the point.
        </h2>
        <p className="text-sm leading-7 text-muted-foreground text-pretty">
          A Ketch report is never stock. Give the brief on the left a real
          problem, a real buyer, and a real constraint, then press Generate. What
          comes back is scored for opportunity, timed against the market, and
          packaged so you can hand it to someone else without rewriting it.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-flow-dense gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3">
        {[
          {
            icon: Lightbulb,
            headline: "Write one sentence",
            body: "The workflow that annoys you most is enough to start.",
          },
          {
            icon: Target,
            headline: "Name the buyer",
            body: "Generic audiences produce generic scores. Be specific.",
          },
          {
            icon: Sparkles,
            headline: "Then read the memo",
            body: "Scoring, timing, pitch, validation, and an execution plan.",
          },
        ].map((item) => (
          <div
            key={item.headline}
            className="flex flex-col gap-1.5 bg-card/80 p-5 text-left"
          >
            <item.icon className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">{item.headline}</p>
            <p className="text-xs leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Gauge className="size-3.5" aria-hidden="true" />
        Everything runs in this browser. No signup, nothing uploaded.
      </p>
    </div>
  )
}

/** Live generation readout; counts in tabular figures. */
function GenerationReadout({
  rateLimit,
  pending,
}: {
  rateLimit: GenerationRateLimitStatus | null
  pending: boolean
}) {
  const remaining = rateLimit?.remaining ?? 0
  const limit = rateLimit?.limit ?? 0
  const exhausted = Boolean(rateLimit?.isExhausted)

  return (
    <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full",
            pending
              ? "animate-pulse bg-primary"
              : exhausted
                ? "bg-amber-500"
                : "bg-emerald-500"
          )}
          aria-hidden="true"
        />
        <p className="text-sm font-medium">
          {pending
            ? "Generating"
            : rateLimit
              ? exhausted
                ? "Cooldown active"
                : "Lab ready"
              : "Checking quota"}
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <p>
          <span className="font-display text-lg text-foreground tabular-nums">
            {rateLimit ? rateLimit.used : "—"}
          </span>
          <span className="ml-1.5">used</span>
        </p>
        <p>
          <span className="font-display text-lg text-foreground tabular-nums">
            {rateLimit ? remaining : "—"}
          </span>
          <span className="ml-1.5">left</span>
        </p>
        <p>
          <span className="font-display text-lg text-foreground tabular-nums">
            {rateLimit ? limit : "—"}
          </span>
          <span className="ml-1.5">per week</span>
        </p>
      </div>
      <p
        className="ml-auto text-xs text-muted-foreground"
        suppressHydrationWarning
      >
        {rateLimit?.resetsAt
          ? exhausted
            ? `Resets ${new Date(rateLimit.resetsAt).toLocaleString()}`
            : `Window resets ${new Date(rateLimit.resetsAt).toLocaleDateString()}`
          : rateLimit
            ? "No active cooldown"
            : "Reading generation quota"}
      </p>
    </div>
  )
}
