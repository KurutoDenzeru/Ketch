"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import { cn } from "cn"
import { Bookmark, Settings, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { brand, navLinks } from "@/lib/brand"

const appNavIcons: Record<string, typeof Sparkles> = {
  Sparkles,
  Bookmark,
  Settings,
}

export function AppNavbar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return <AppDock pathname={pathname} />
}

function Dock({ children }: { children: ReactNode }) {
  const [docked, setDocked] = useState(false)

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="pointer-events-none fixed inset-x-0 z-50
                   md:bottom-auto md:top-4 top-auto bottom-3
                   flex justify-center px-3"
      >
        <div
          className={cn(
            "pointer-events-auto flex max-w-fit items-center gap-1 rounded-full px-2.5 py-2",
            "transition-[background-color,border-color,box-shadow] duration-500 ease-out",
            docked ? "glass hairline shadow-md" : "border border-transparent"
          )}
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
      className="mx-1 hidden h-5 w-px bg-border/70 md:inline-block"
    />
  )
}

function BrandLockup({ to }: { to: "/" | "/app/new" }) {
  return (
    <Link
      to={to}
      aria-label={`${brand.name} home`}
      className="inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-3
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
      <span className="font-display text-lg leading-none font-semibold tracking-[-0.015em]">
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

function AppDock({ pathname }: { pathname: string }) {
  return (
    <Dock>
      <NavItemTooltip label={`${brand.name} home`}>
        <BrandLockup to="/" />
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
