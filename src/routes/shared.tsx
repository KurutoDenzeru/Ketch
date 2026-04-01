import { createFileRoute } from "@tanstack/react-router"

import { SharedIdeaPage } from "@/components/shared-idea-page"
import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/shared")({
  head: () =>
    buildSeoHead({
      path: "/shared",
      title: "Shared Ideas | Ketch",
      description:
        "Browse shared startup idea snapshots created and opened in Ketch.",
      keywords:
        "shared startup ideas, startup snapshots, founder ideas, Ketch shared ideas",
      imageAlt: "Ketch shared ideas social preview",
    }),
  component: SharedTabRoute,
})

function SharedTabRoute() {
  return <SharedIdeaPage />
}
