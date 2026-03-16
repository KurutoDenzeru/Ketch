import { createFileRoute } from "@tanstack/react-router"

import { SharedIdeaPage } from "@/components/shared-idea-page"

export const Route = createFileRoute("/idea/$slug")({
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
  component: SharedIdeaSlugRoute,
})

function SharedIdeaSlugRoute() {
  const { data } = Route.useSearch()

  return <SharedIdeaPage data={data} />
}
