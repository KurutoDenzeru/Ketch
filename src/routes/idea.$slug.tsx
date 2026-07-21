import { createFileRoute, redirect } from "@tanstack/react-router"

import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/idea/$slug")({
  head: () =>
    buildSeoHead({
      path: "/share",
      title: "Shared idea | Ketch",
      description: "Shared idea snapshot.",
      imageAlt: "Ketch shared idea",
      robots: "noindex, follow",
    }),
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/share/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    })
  },
  component: () => null,
})
