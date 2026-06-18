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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

function Dock({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="pointer-events-none fixed inset-x-0 z-50
                   md:bottom-auto md:top-3 top-auto bottom-3
                   flex justify-center px-3"
      >
        <div
          className="pointer-events-auto flex max-w-fit items-center gap-1
                     rounded-full border border-border/60
                     bg-background/70 px-1.5 py-1.5 shadow-xs
                     ring-1 ring-foreground/5 backdrop-blur-xl"
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
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

function BrandLockup({ to }: { to: "/" | "/app/new" }) {
  return (
    <Link
      to={to}
      aria-label={`${brand.name} home`}
      className="inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-2.5
                 transition-transform active:scale-95
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full">
        <img
          src="/Sparkle.webp"
          alt=""
          width={28}
          height={28}
          className="size-full object-cover"
        />
      </span>
      <span className="font-display text-base font-semibold leading-none tracking-tight">
        {brand.name}
      </span>
    </Link>
  )
}

type NavItemTooltipProps = {
  label: string
  children: ReactNode
}

function NavItemTooltip({ label, children }: NavItemTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function MarketingDock({ pathname: _pathname }: { pathname: string }) {
  return (
    <Dock>
      <NavItemTooltip label={`${brand.name} home`}>
        <BrandLockup to="/" />
      </NavItemTooltip>

      <DockSeparator />

      <nav
        aria-label="Primary"
        className="flex items-center gap-0.5"
      >
        {navLinks.marketing.map((link) => {
          const Icon = marketingNavIcons[link.icon] ?? Compass
          return (
            <NavItemTooltip key={link.href} label={link.label}>
              <a
                href={link.href}
                className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium
                           text-foreground/75 transition-colors
                           hover:bg-muted/60 hover:text-foreground
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{link.label}</span>
              </a>
            </NavItemTooltip>
          )
        })}
      </nav>

      <DockSeparator />

      <NavItemTooltip label="Open the app">
        <Button asChild size="sm" className="rounded-full">
          <Link to="/app/new">
            <span className="hidden md:inline">Open the app</span>
            <ArrowRight className="size-4 md:ml-1" />
          </Link>
        </Button>
      </NavItemTooltip>
    </Dock>
  )
}

function AppDock({ pathname }: { pathname: string }) {
  return (
    <Dock>
      <NavItemTooltip label={`${brand.name} home`}>
        <BrandLockup to="/app/new" />
      </NavItemTooltip>

      <DockSeparator />

      <nav aria-label="App" className="flex items-center gap-0.5">
        {navLinks.app.map((item) => {
          const Icon = appNavIcons[item.icon] ?? Sparkles
          const isActive = isAppRouteActive(pathname, item.to)
          return (
            <NavItemTooltip key={item.to} label={item.label}>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </NavItemTooltip>
          )
        })}
      </nav>

      <DockSeparator />

      <NavItemTooltip label="Back to the marketing site">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden rounded-full md:inline-flex"
        >
          <Link to="/">
            Back to site
            <ArrowRight className="size-4 ml-1" />
          </Link>
        </Button>
      </NavItemTooltip>
      <NavItemTooltip label="Generate a new idea">
        <Button asChild size="sm" className="rounded-full">
          <Link to="/app/new">
            <Sparkles className="size-4 md:mr-1" />
            <span className="hidden md:inline">New idea</span>
            <span className="md:hidden">New</span>
          </Link>
        </Button>
      </NavItemTooltip>
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
