import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/idea")({
  head: () => ({
    meta: [
      {
        title: "Shared Idea | Ketch",
      },
    ],
  }),
  component: IdeaRouteShell,
})

function IdeaRouteShell() {
  return <Outlet />
}
