import { createFileRoute } from "@tanstack/react-router"

import { SharedIdeaPage } from "@/components/shared-idea-page"
import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/idea/$slug")({
  head: ({ params }) =>
    buildSeoHead({
      path: `/idea/${params.slug}`,
      title: "Shared Idea | Ketch",
      description:
        "Open a shareable startup idea snapshot from Ketch with pitch and validation details.",
      keywords:
        "shared startup idea, startup snapshot, founder pitch share, Ketch shared idea",
      imageAlt: "Ketch shared idea social preview",
    }),
  component: SharedIdeaSlugRoute,
})

function SharedIdeaSlugRoute() {
  const { slug } = Route.useParams()

  return <SharedIdeaPage shareId={slug} />
}
