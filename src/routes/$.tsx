import { createFileRoute } from "@tanstack/react-router"

import { NotFoundPage } from "@/components/not-found-page"
import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/$")({
  head: () =>
    buildSeoHead({
      path: "/",
      title: "Page not found | Ketch",
      description: "That Ketch page does not exist.",
      imageAlt: "Ketch 404",
      robots: "noindex, follow",
    }),
  component: NotFoundPage,
})
