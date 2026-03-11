"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import { Bookmark, FlaskConical, Waves } from "lucide-react"

import { cn } from "@/lib/utils"

export function AppNavbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const navItems = [
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
  ] as const

  return (
    <>
      <div className="fixed inset-x-0 top-4 z-40 hidden px-4 md:top-5 md:block md:px-6">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <div className="flex w-full items-center justify-between rounded-[1.75rem] border border-white/35 bg-background/58 px-4 py-3 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/48 md:px-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-2 py-1.5 transition-colors hover:bg-white/10"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/85">
                <Waves className="size-4" />
              </span>
              <span className="font-display text-2xl leading-none">Ketch</span>
            </Link>

            <div className="flex items-center gap-2">
              {navItems.map(({ to, label, active }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-lg border border-transparent px-4 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
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
        <div className="mx-auto flex max-w-sm justify-center">
          <div className="grid w-full grid-cols-4 items-center rounded-[1.6rem] border border-white/35 bg-background/74 px-2 py-2 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <Link
              to="/"
              aria-label="Ketch icon"
              className="inline-flex min-h-14 items-center justify-center px-2 py-2 text-foreground/80 transition-colors hover:text-foreground"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-[1rem] border border-border/70 bg-background/85">
                <Waves className="size-4" />
              </span>
            </Link>

            <Link
              to="/"
              aria-label="Ketch home"
              className="inline-flex min-h-14 items-center justify-center px-2 py-2 text-center transition-colors hover:bg-white/6"
            >
              <span className="font-display text-xl leading-none">Ketch</span>
            </Link>

            {navItems.map(({ to, label, icon: Icon, active }) => (
              <Link
                key={to}
                to={to}
                title={label}
                aria-label={label}
                className={cn(
                  "inline-flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-all",
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-foreground/72 hover:bg-white/6 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="leading-none">
                  {label === "Saved Ideas" ? "Saved" : "Idea Lab"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
