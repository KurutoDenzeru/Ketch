"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  ChevronRight,
  LoaderCircle,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react"
import { toast } from "sonner"

import type {
  MarketValidation,
  SavedIdea,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import { IdeaCard } from "@/components/idea-card"
import { EmptyState } from "@/components/empty-state"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildSharedIdeaUrl,
  formatIdeaAsAgentPrompt,
  formatIdeaAsMarkdown,
  formatIdeaForClipboard,
  getSavedIdeas,
  isIdeaSaved,
  removeIdea,
  updateSavedIdea,
} from "@/lib/idea-storage"
import { recordActivity } from "@/lib/activity-log"
import { recordSharedLink } from "@/lib/shared-links"
import {
  generateMarketValidation,
  generatePitch,
  getGenerationRateLimitStatus,
  regenerateIdea,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import { createSharedIdeaLink } from "@/lib/shared-idea-store"
import { buildSeoHead } from "@/lib/seo"

const generationRateLimitQueryKey = ["generation-rate-limit"] as const

export const Route = createFileRoute("/app/library_/$id")({
  head: () =>
    buildSeoHead({
      path: "/app/library",
      title: "Saved idea | Ketch",
      description: "Revisit and refine a saved Ketch idea.",
      imageAlt: "Ketch saved idea",
      robots: "noindex, follow",
    }),
  component: LibraryDetailPage,
})

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function LibraryDetailPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState<SavedIdea | null>(null)
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
    if (!params.id) return
    const all = getSavedIdeas()
    const found = all.find((item) => item.id === params.id) ?? null
    setSaved(found)
    setIdea(found?.idea ?? null)
    setPitch(found?.pitch ?? null)
    setMarketValidation(found?.marketValidation ?? null)
    setHydrated(true)
  }, [params.id])

  const currentPayload: ShareableIdeaPayload | null = useMemo(
    () => (idea ? { idea, pitch, marketValidation } : null),
    [idea, pitch, marketValidation]
  )

  const pitchMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      generatePitch({ data: { idea: current } }),
    onSuccess: (next) => {
      setPitch(next)
      persist({ idea: idea!, pitch: next, marketValidation })
      toast.success("Pitch ready", {
        description: "The saved idea now includes the refreshed pitch.",
      })
    },
    onError: (error) => {
      toast.error("Failed to generate pitch", { description: error.message })
    },
  })

  const marketValidationMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      generateMarketValidation({ data: { idea: current } }),
    onSuccess: (next) => {
      setMarketValidation(next)
      persist({ idea: idea!, pitch, marketValidation: next })
      toast.success("Validation ready", {
        description: "The saved idea now includes refreshed validation.",
      })
    },
    onError: (error) => {
      toast.error("Failed to run validation", { description: error.message })
    },
  })

  const regenerateIdeaMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      regenerateIdea({ data: { idea: current } }),
    onMutate: () =>
      toast.loading("Regenerating idea…", {
        id: "regenerate-saved",
        description: "Ketch is rebuilding this saved snapshot.",
      }),
    onSuccess: (next) => {
      setIdea(next)
      setPitch(null)
      setMarketValidation(null)
      void refreshGenerationRateLimit()
      persist({ idea: next, pitch: null, marketValidation: null })
      recordActivity("idea_generated", { idea: next })
      toast.success("Idea regenerated", {
        id: "regenerate-saved",
        description: `${next.name} is the new saved concept.`,
      })
    },
    onError: (error) => {
      void refreshGenerationRateLimit()
      toast.error("Failed to regenerate idea", {
        id: "regenerate-saved",
        description: error.message,
      })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: current } }),
    onMutate: () =>
      toast.loading("Generating new titles…", {
        id: "generate-saved-titles",
        description: "Ketch is generating a fresh set of names.",
      }),
    onSuccess: ({ alternativeNames }) => {
      if (!idea) return
      const next = { ...idea, alternativeNames }
      setIdea(next)
      void refreshGenerationRateLimit()
      persist({ idea: next, pitch, marketValidation })
      toast.success("New titles ready", {
        id: "generate-saved-titles",
        description: "A fresh set of saved title options is ready to review.",
      })
    },
    onError: (error) => {
      void refreshGenerationRateLimit()
      toast.error("Failed to generate new titles", {
        id: "generate-saved-titles",
        description: error.message,
      })
    },
  })

  function persist(payload: ShareableIdeaPayload) {
    if (!saved) return
    const next = updateSavedIdea(saved.id, payload)
    setSaved(next)
  }

  async function createShareLink(payload: ShareableIdeaPayload) {
    const shared = await createSharedIdeaLink({ data: { payload } })
    recordSharedLink(shared.shareId, shared.payload)
    return {
      shareId: shared.shareId,
      shareUrl: buildSharedIdeaUrl(shared.shareId),
    }
  }

  function setCopy(format: "text" | "markdown" | "agent-prompt" | "link") {
    setCopiedFormat(format)
    window.setTimeout(() => setCopiedFormat(null), 2000)
  }

  function handleCopy(
    format: "text" | "markdown" | "agent-prompt" | "link",
    value: string
  ) {
    return copyText(value)
      .then(() => setCopy(format))
      .catch(() =>
        toast.error("Clipboard unavailable", {
          description: "This browser blocked clipboard access.",
        })
      )
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
      setCopy("link")
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

  function handleSave() {
    if (!currentPayload) return
    persist(currentPayload)
    toast.success("Saved idea updated", {
      description: "Changes to this saved idea were written locally.",
    })
  }

  function handleRemove() {
    if (!saved) return
    if (
      !window.confirm(
        "Remove this saved idea? This action can't be undone (the share link stays valid)."
      )
    ) {
      return
    }
    removeIdea(saved.id)
    recordActivity("idea_removed", { idea: saved.idea, ideaId: saved.id })
    toast.success("Saved idea removed", {
      description: "Returning to the library.",
    })
    navigate({ to: "/app/library" })
  }

  if (hydrated && !saved) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 md:px-6">
        <EmptyState
          icon={<Bookmark className="size-10" />}
          title="Saved idea not found"
          description="It may have been removed, or this link is from a different browser. The library is local to this device."
          action={
            <Button asChild className="rounded-full">
              <Link to="/app/library">Back to library</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <nav
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-3 rounded-full"
        >
          <Link to="/app/library">
            <ArrowLeft className="size-4" />
            Library
          </Link>
        </Button>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{idea?.name ?? "Loading…"}</span>
      </nav>

      <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <SectionEyebrow icon={CalendarDays}>
              Saved snapshot
            </SectionEyebrow>
            <span suppressHydrationWarning>
              {saved ? new Date(saved.createdAt).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => idea && regenerateIdeaMutation.mutate(idea)}
              disabled={
                regenerateIdeaMutation.isPending ||
                Boolean(generationRateLimit?.isExhausted)
              }
            >
              {regenerateIdeaMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Regenerate idea
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => idea && pitchMutation.mutate(idea)}
              disabled={pitchMutation.isPending}
            >
              {pitchMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <WandSparkles className="size-4" />
              )}
              Regenerate pitch
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="rounded-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {idea && currentPayload ? (
        <IdeaCard
          idea={idea}
          pitch={pitch}
          marketValidation={marketValidation}
          isPitchLoading={pitchMutation.isPending}
          isMarketValidationLoading={marketValidationMutation.isPending}
          isRegeneratingTitles={regenerateTitlesMutation.isPending}
          isSharing={isSharing}
          isSaved={isIdeaSaved(idea)}
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
            const next = { ...idea, name }
            setIdea(next)
            persist({ idea: next, pitch, marketValidation })
            toast.success("Startup name swapped", {
              description: `${name} is now the active saved idea name.`,
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
          onSave={handleSave}
        />
      ) : (
        <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
          <CardContent className="space-y-3 p-6">
            <div className="h-12 w-2/3 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
