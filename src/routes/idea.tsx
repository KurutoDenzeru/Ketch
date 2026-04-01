import { Outlet, createFileRoute } from "@tanstack/react-router"

import { buildSeoHead } from "@/lib/seo"

export const Route = createFileRoute("/idea")({
  head: () =>
    buildSeoHead({
      path: "/idea",
      title: "Shared Idea | Ketch",
      description:
        "Review and share startup idea snapshots generated inside Ketch.",
      keywords:
        "shared startup idea, startup snapshot, founder idea share, Ketch shared idea",
      imageAlt: "Ketch shared idea social preview",
    }),
  component: IdeaRouteShell,
})

function IdeaRouteShell() {
  return <Outlet />
}
