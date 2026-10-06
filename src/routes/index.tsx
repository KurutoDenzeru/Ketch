import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  // The marketing page is gone. `/` is now a doorway into the lab.
  beforeLoad: () => {
    throw redirect({ to: "/app/new", statusCode: 302 })
  },
  component: () => null,
})
