"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Bookmark, Compass, Globe } from "lucide-react"
import { toast } from "sonner"

import type {
  MarketValidation,
  ShareableIdeaPayload,
  StartupIdea,
  StartupPitch,
} from "@/types/idea"
import { Container } from "@/components/container"
import { IdeaCard } from "@/components/idea-card"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildIdeaShareUrl,
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
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [idea, setIdea] = useState<StartupIdea | null>(null)
  const [pitch, setPitch] = useState<StartupPitch | null>(null)
  const [marketValidation, setMarketValidation] = useState<MarketValidation | null>(null)
  type RecentEntry = ReturnType<typeof getRecentSharedIdeas>[number]
  const [recent, setRecent] = useState<RecentEntry | null>(null)
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
    setHydrated(true)
    setRecent(getRecentSharedIdeas()[0] ?? null)
  }, [])

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
      saveRecentSharedIdea(inline, decoded)
      setRecent(getRecentSharedIdeas()[0] ?? null)
      recordActivity("link_viewed", { idea: decoded.idea, shareId: inline })
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

  function handleCopyShareLink() {
    if (!currentPayload) return
    const shareUrl = buildIdeaShareUrl(currentPayload)
    copyText(shareUrl)
      .then(() => {
        setCopy("link")
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

  function handleSave() {
    if (!currentPayload) return
    const saved = saveIdea(currentPayload)
    recordActivity("idea_saved", { idea: currentPayload.idea, ideaId: saved.id })
    toast.success("Idea saved", {
      description: "Your startup idea is stored in this browser.",
    })
  }

  if (!hydrated) {
    return (
      <Container width="narrow" innerClassName="py-20 md:py-28">
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </Container>
    )
  }

  if (!currentPayload || !idea) {
    return (
      <Container width="narrow" innerClassName="gap-8 py-20 md:py-28">
        <header className="space-y-5">
          <h1 className="max-w-[14ch] font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.02] tracking-[-0.03em] text-balance">
            No shared idea here.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground text-pretty">
            This link may have been revoked, or you may be on a different
            device. Open a shared link once and {brand.name} will keep the
            latest snapshot available offline.
          </p>
          {recent ? (
            <p className="text-sm text-muted-foreground">
              Last opened here:{" "}
              <strong className="font-medium text-foreground">
                {recent.payload.idea.name}
              </strong>
            </p>
          ) : null}
        </header>
        <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-8">
          <Button onClick={() => navigate({ to: "/app/new" })}>
            <Compass className="size-4" aria-hidden="true" />
            Open the lab
          </Button>
          <Button
            onClick={() => navigate({ to: "/app/library" })}
            variant="outline"
          >
            <Bookmark className="size-4" aria-hidden="true" />
            View library
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container width="wide" as="article" innerClassName="py-16 md:py-24">
        <header className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Globe className="size-4 text-primary" aria-hidden="true" />
              Shared snapshot
            </span>
            <span className="inline-flex items-baseline gap-2">
              <span className="font-display text-2xl leading-none font-semibold tabular-nums text-foreground">
                {idea.validationScore}
              </span>
              <span className="tabular-nums">/10 validation</span>
            </span>
          </div>

          <div className="space-y-6">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-balance">
              {idea.name}
            </h1>
            <p className="max-w-2xl font-display text-lg leading-relaxed text-muted-foreground italic text-pretty sm:text-xl">
              {idea.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
            <span>{idea.category}</span>
            <span className="tabular-nums">
              Validation score {idea.validationScore} of 10
            </span>
            <span className="text-pretty">
              {idea.audience.slice(0, 80)}
              {idea.audience.length > 80 ? "…" : ""}
            </span>
          </div>
        </header>

        <ScrollReveal className="mt-12 md:mt-16">
          <IdeaCard
            variant="report"
            idea={idea}
            pitch={pitch}
            marketValidation={marketValidation}
            isPitchLoading={pitchMutation.isPending}
            isMarketValidationLoading={marketValidationMutation.isPending}
            isRegeneratingTitles={regenerateTitlesMutation.isPending}
            isSharing={false}
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
        </ScrollReveal>
      </Container>
  )
}
