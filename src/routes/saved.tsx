import { useEffect, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Bookmark, Copy, LoaderCircle, Share2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  buildIdeaSharePath,
  buildIdeaShareUrl,
  formatIdeaForClipboard,
  getSavedIdeas,
  removeIdea,
} from "@/lib/idea-storage"
import type { SavedIdea } from "@/types/idea"

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

function SavedIdeasPage() {
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState<SavedIdea[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [activeCopyId, setActiveCopyId] = useState<string | null>(null)

  useEffect(() => {
    setIdeas(getSavedIdeas())
  }, [])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
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
                Reopen promising concepts, share them, or prune the ones that no
                longer feel worth pursuing.
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
            <p>
              Generated pitches and market validation notes are preserved too.
            </p>
            <p>
              Share links encode the current idea payload directly in the URL.
            </p>
          </CardContent>
        </Card>
      </section>

      {feedback ? (
        <p className="text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      <section className="space-y-5">
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
            <Card
              key={savedIdea.id}
              className="rounded-[2rem] border border-border/70 py-0 shadow-sm"
            >
              <CardHeader className="gap-4 border-b border-border/70 px-6 py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {savedIdea.idea.category}
                  </Badge>
                  {savedIdea.pitch ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      Pitch ready
                    </Badge>
                  ) : null}
                  {savedIdea.marketValidation ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      Validation ready
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    <CardTitle className="font-display text-4xl leading-none">
                      {savedIdea.idea.name}
                    </CardTitle>
                    <p className="text-base leading-7 text-muted-foreground">
                      {savedIdea.idea.tagline}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-muted/35 p-4">
                    <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                      Validation score
                    </div>
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <span className="font-display text-4xl leading-none">
                        {savedIdea.idea.validationScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <Progress
                      value={savedIdea.idea.validationScore * 10}
                      className="h-2.5"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-6 py-6">
                <p className="text-sm leading-7 text-foreground">
                  {savedIdea.idea.description}
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Audience", savedIdea.idea.audience],
                    ["Unique twist", savedIdea.idea.twist],
                    ["Monetization", savedIdea.idea.monetization],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4"
                    >
                      <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                        {label}
                      </div>
                      <p className="text-sm leading-6 text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {savedIdea.idea.alternativeNames.map((name) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="rounded-full px-3 py-1"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {savedIdea.idea.analysis.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" asChild>
                    <a href={buildIdeaSharePath(savedIdea)}>
                      <Share2 />
                      Open shared view
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setActiveCopyId(savedIdea.id)
                      try {
                        await copyText(buildIdeaShareUrl(savedIdea))
                        setFeedback("Share link copied.")
                      } finally {
                        setActiveCopyId(null)
                      }
                    }}
                    disabled={activeCopyId === savedIdea.id}
                  >
                    {activeCopyId === savedIdea.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Copy />
                    )}
                    Copy share link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setActiveCopyId(savedIdea.id)
                      try {
                        await copyText(formatIdeaForClipboard(savedIdea))
                        setFeedback("Idea copied to clipboard.")
                      } finally {
                        setActiveCopyId(null)
                      }
                    }}
                    disabled={activeCopyId === savedIdea.id}
                  >
                    {activeCopyId === savedIdea.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Bookmark />
                    )}
                    Copy summary
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const nextIdeas = removeIdea(savedIdea.id)
                      setIdeas(nextIdeas)
                      setFeedback("Saved idea removed.")
                    }}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  )
}
