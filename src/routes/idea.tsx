import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/idea")({
  head: () => ({
    meta: [
      {
        title: "Shared Idea | AI Startup Idea Lab",
      },
    ],
  }),
  component: IdeaRouteShell,
})

function IdeaRouteShell() {
  return <Outlet />
}
