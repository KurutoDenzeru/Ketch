import { createFileRoute } from "@tanstack/react-router"

import { SharedIdeaPage } from "@/components/shared-idea-page"

export const Route = createFileRoute("/idea/$slug")({
  head: () => ({
    meta: [
      {
        title: "Shared Idea | AI Startup Idea Lab",
      },
    ],
  }),
  component: SharedIdeaSlugRoute,
})

function SharedIdeaSlugRoute() {
  const { slug } = Route.useParams()

  return <SharedIdeaPage shareId={slug} />
}
