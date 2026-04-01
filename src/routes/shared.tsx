import { createFileRoute } from "@tanstack/react-router"

import { SharedIdeaPage } from "@/components/shared-idea-page"

export const Route = createFileRoute("/shared")({
  head: () => ({
    meta: [
      {
        title: "Shared Idea | Ketch",
      },
    ],
  }),
  component: SharedTabRoute,
})

function SharedTabRoute() {
  return <SharedIdeaPage />
}
