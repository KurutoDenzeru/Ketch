"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import { Bookmark, FlaskConical, Waves } from "lucide-react"

import { cn } from "@/lib/utils"

export function AppNavbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <>
      <div className="fixed inset-x-0 top-4 z-40 hidden px-4 md:top-5 md:block md:px-6">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <div className="flex w-full items-center justify-between rounded-[1.75rem] border border-white/35 bg-background/58 px-4 py-3 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/48 md:px-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full px-2 py-1.5 transition-colors hover:bg-white/10"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/85">
                <Waves className="size-4" />
              </span>
              <span className="font-display text-2xl leading-none">Ketch</span>
            </Link>

            <div className="flex items-center gap-2">
              {[
                {
                  to: "/",
                  label: "Idea Lab",
                  active: pathname === "/",
                },
                {
                  to: "/saved",
                  label: "Saved Ideas",
                  active: pathname === "/saved",
                },
              ].map(({ to, label, active }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all",
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-background/80 hover:bg-muted/60"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
        <div className="mx-auto flex max-w-md justify-center">
          <div className="flex w-full items-center justify-between rounded-[1.75rem] border border-white/35 bg-background/72 px-3 py-2.5 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/85">
                <Waves className="size-4" />
              </span>
              <span className="font-display text-xl leading-none">Ketch</span>
            </Link>

            <div className="flex items-center gap-2">
              {[
                {
                  to: "/",
                  label: "Idea Lab",
                  icon: FlaskConical,
                  active: pathname === "/",
                },
                {
                  to: "/saved",
                  label: "Saved Ideas",
                  icon: Bookmark,
                  active: pathname === "/saved",
                },
              ].map(({ to, label, icon: Icon, active }) => (
                <Link
                  key={to}
                  to={to}
                  title={label}
                  aria-label={label}
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-full border transition-all",
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border/70 bg-background/85 hover:bg-muted/60"
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
