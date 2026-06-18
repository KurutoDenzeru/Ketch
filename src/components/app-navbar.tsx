"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import {
  ArrowRight,
  Bookmark,
  Compass,
  HelpCircle,
  LineChart,
  Settings,
  Sparkles,
} from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { brand, navLinks } from "@/lib/brand"
import { cn } from "@/lib/utils"

const appNavIcons: Record<string, typeof Sparkles> = {
  Sparkles,
  Bookmark,
  Settings,
}

const marketingNavIcons: Record<string, typeof Compass> = {
  Compass,
  LineChart,
  HelpCircle,
}

type AppNavbarProps = {
  variant: "marketing" | "app"
}

export function AppNavbar({ variant }: AppNavbarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (variant === "marketing") {
    return <MarketingDock pathname={pathname} />
  }

  return <AppDock pathname={pathname} />
}

type DockProps = {
  children: ReactNode
}

function Dock({ children }: DockProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50
                 md:bottom-auto md:top-3 top-auto bottom-3
                 flex justify-center px-3"
    >
      <div
        className="pointer-events-auto flex max-w-fit items-center gap-1
                   rounded-full border border-border/60
                   bg-background/70 px-2 py-1.5 shadow-xs
                   ring-1 ring-foreground/5 backdrop-blur-xl"
      >
        {children}
      </div>
    </div>
  )
}

function DockSeparator() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 hidden h-5 w-px bg-border/70 md:inline-block"
    />
  )
}

function MarketingDock({ pathname: _pathname }: { pathname: string }) {
  return (
    <Dock>
      <Link
        to="/"
        aria-label={`${brand.name} home`}
        className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full
                   transition-transform active:scale-95
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src="/Sparkle.webp"
          alt=""
          width={36}
          height={36}
          className="size-full object-cover"
        />
      </Link>

      <DockSeparator />

      <nav
        aria-label="Primary"
        className="flex items-center gap-0.5"
      >
        {navLinks.marketing.map((link) => {
          const Icon = marketingNavIcons[link.icon] ?? Compass
          return (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium
                         text-foreground/75 transition-colors
                         hover:bg-muted/60 hover:text-foreground
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden md:inline">{link.label}</span>
            </a>
          )
        })}
      </nav>

      <DockSeparator />

      <Button
        asChild
        size="sm"
        className="rounded-full"
      >
        <Link to="/app/new">
          <span className="hidden md:inline">Open the app</span>
          <ArrowRight className="size-4 md:ml-1" />
        </Link>
      </Button>
    </Dock>
  )
}

function AppDock({ pathname }: { pathname: string }) {
  return (
    <Dock>
      <Link
        to="/app/new"
        aria-label={`${brand.name} — New idea`}
        className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full
                   transition-transform active:scale-95
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src="/Sparkle.webp"
          alt=""
          width={36}
          height={36}
          className="size-full object-cover"
        />
      </Link>

      <DockSeparator />

      <nav aria-label="App" className="flex items-center gap-0.5">
        {navLinks.app.map((item) => {
          const Icon = appNavIcons[item.icon] ?? Sparkles
          const isActive = isAppRouteActive(pathname, item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "group relative inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <DockSeparator />

      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-full"
      >
        <Link to="/">
          <span className="hidden md:inline">Back to site</span>
          <ArrowRight className="size-4 md:ml-1" />
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="rounded-full"
      >
        <Link to="/app/new">
          <Sparkles className="size-4 md:mr-1" />
          <span className="hidden md:inline">New idea</span>
          <span className="md:hidden">New</span>
        </Link>
      </Button>
    </Dock>
  )
}

function isAppRouteActive(pathname: string, to: string) {
  if (to === "/app") {
    return pathname === "/app" || pathname === "/app/"
  }
  if (to === "/app/new") {
    return pathname === "/app/new" || pathname === "/app"
  }
  if (to === "/app/library") {
    return pathname === "/app/library" || pathname.startsWith("/app/library/")
  }
  if (to === "/app/settings") {
    return pathname === "/app/settings"
  }
  return pathname.startsWith(to)
}
