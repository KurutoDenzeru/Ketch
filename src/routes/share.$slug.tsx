"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Bookmark, Compass, Globe } from "lucide-react"
import { toast } from "sonner"

import type {
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import { IdeaCard } from "@/components/idea-card"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildSharedIdeaUrl,
  decodeIdeaFromUrl,
  formatIdeaAsAgentPrompt,
  formatIdeaAsMarkdown,
  formatIdeaForClipboard,
  getRecentSharedIdeas,
  isIdeaSaved,
  saveIdea,
  saveRecentSharedIdea,
} from "@/lib/idea-storage"
import { recordActivity } from "@/lib/activity-log"
import { recordSharedLink } from "@/lib/shared-links"
import {
  generateMarketValidation,
  generatePitch,
  getGenerationRateLimitStatus,
  regenerateIdeaTitles,
} from "@/lib/gemini"
import { createSharedIdeaLink, getSharedIdeaLink } from "@/lib/shared-idea-store"
import { buildSeoHead } from "@/lib/seo"
import { brand } from "@/lib/brand"

const generationRateLimitQueryKey = ["generation-rate-limit"] as const

export const Route = createFileRoute("/share/$slug")({
  head: () =>
    buildSeoHead({
      path: "/share",
      title: "Shared idea | Ketch",
      description: "A shareable startup idea snapshot, hosted by Ketch.",
      keywords: "shared startup idea, Ketch share, founder idea",
      imageAlt: "Ketch shared idea",
    }),
  component: SharedIdeaRoute,
})

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function SharedIdeaRoute() {
  const params = useParams({ strict: false })
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [idea, setIdea] = useState<StartupIdea | null>(null)
  const [pitch, setPitch] = useState<StartupPitch | null>(null)
  const [marketValidation, setMarketValidation] = useState<MarketValidation | null>(null)
  type RecentEntry = ReturnType<typeof getRecentSharedIdeas>[number]
  const [recent, setRecent] = useState<RecentEntry | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copiedFormat, setCopiedFormat] = useState<
    "text" | "markdown" | "agent-prompt" | "link" | null
  >(null)

  const sharedQuery = useQuery({
    queryKey: ["shared-idea", params.slug],
    queryFn: () => getSharedIdeaLink({ data: { shareId: params.slug ?? "" } }),
    enabled: Boolean(params.slug),
  })
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
    setHydrated(true)
    setRecent(getRecentSharedIdeas()[0] ?? null)
  }, [])

  useEffect(() => {
    const data = sharedQuery.data
    if (data) {
      setIdea(data.payload.idea)
      setPitch(data.payload.pitch ?? null)
      setMarketValidation(data.payload.marketValidation ?? null)
      saveRecentSharedIdea(data.shareId, data.payload)
      setRecent(getRecentSharedIdeas()[0] ?? null)
      recordActivity("link_viewed", {
        idea: data.payload.idea,
        shareId: data.shareId,
      })
    }
  }, [sharedQuery.data])

  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URLSearchParams(window.location.search)
    const inline = url.get("data")
    if (!inline) return
    const decoded = decodeIdeaFromUrl(inline)
    if (decoded) {
      setIdea(decoded.idea)
      setPitch(decoded.pitch ?? null)
      setMarketValidation(decoded.marketValidation ?? null)
    }
  }, [])

  const pitchMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      generatePitch({ data: { idea: current } }),
    onSuccess: (next) => {
      setPitch(next)
      toast.success("Pitch ready", {
        description: "The founder-ready narrative has been refreshed.",
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
      toast.success("Validation ready", {
        description: "The shared snapshot now includes fresh validation.",
      })
    },
    onError: (error) => {
      toast.error("Failed to run validation", { description: error.message })
    },
  })

  const regenerateTitlesMutation = useMutation({
    mutationFn: (current: StartupIdea) =>
      regenerateIdeaTitles({ data: { idea: current } }),
    onMutate: () =>
      toast.loading("Generating new titles…", {
        id: "generate-shared-titles",
        description: "Ketch is generating a fresh set of names.",
      }),
    onSuccess: ({ alternativeNames }) => {
      setIdea((current) => (current ? { ...current, alternativeNames } : current))
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
    ? { idea, pitch, marketValidation }
    : null

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
    const saved = saveIdea(currentPayload)
    recordActivity("idea_saved", { idea: currentPayload.idea, ideaId: saved.id })
    toast.success("Idea saved", {
      description: "Your startup idea is stored in this browser.",
    })
  }

  if (!hydrated || (sharedQuery.isPending && !currentPayload)) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-12 md:px-6">
        <Card className="rounded-3xl border border-border/60 bg-card/80 py-0 shadow-card">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentPayload || !idea) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 md:px-6">
        <Card className="rounded-3xl border border-dashed border-border/60 bg-card/80 py-0">
          <CardContent className="space-y-4 p-8 text-center">
            <SectionEyebrow icon={Globe}>Shared idea</SectionEyebrow>
            <h1 className="font-display text-3xl leading-tight">
              No shared idea here.
            </h1>
            <p className="text-sm text-muted-foreground">
              This link may have been revoked, or you may be on a different
              device. Open a shared link once and {brand.name} will keep the
              latest snapshot available offline.
            </p>
            {recent ? (
              <p className="text-xs text-muted-foreground">
                Last opened here: <strong>{recent.payload.idea.name}</strong>
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => navigate({ to: "/app/new" })} className="rounded-full">
                <Compass className="size-4" />
                Open the lab
              </Button>
              <Button
                onClick={() => navigate({ to: "/app/library" })}
                variant="outline"
                className="rounded-full"
              >
                <Bookmark className="size-4" />
                View library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <header className="flex flex-col gap-3">
        <SectionEyebrow icon={Globe}>Shared snapshot</SectionEyebrow>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          A shared startup idea.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Anyone with this link can review the full memo. Save it locally,
          refresh the pitch, or generate a tighter market validation pass.
        </p>
      </header>

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
        onSave={handleSave}
      />
    </div>
  )
}
