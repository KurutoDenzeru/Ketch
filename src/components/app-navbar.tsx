"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import {
  BarChart3,
  Bookmark,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { brand, navLinks } from "@/lib/brand"
import { cn } from "@/lib/utils"

const appNavIcons = {
  Sparkles,
  Bookmark,
  BarChart3,
  Settings,
} as const

type AppNavbarProps = {
  variant: "marketing" | "app"
}

export function AppNavbar({ variant }: AppNavbarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (variant === "marketing") {
    return <MarketingNavbarShell pathname={pathname} />
  }

  return <AppNavbarShell pathname={pathname} />
}

function MarketingNavbarShell({ pathname: _pathname }: { pathname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          to="/"
          aria-label={`${brand.name} home`}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl">
            <img
              src="/Sparkle.webp"
              alt=""
              width={36}
              height={36}
              className="size-full object-cover"
            />
          </span>
          <span className="font-display text-xl leading-none">{brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navLinks.marketing.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" className="rounded-full">
            <Link to="/app/new">Open the app</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display">{brand.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile primary">
                {navLinks.marketing.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-base font-medium text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <Button asChild className="mt-4 rounded-full">
                  <Link to="/app/new">Open the app</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function AppNavbarShell({ pathname }: { pathname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          to="/app/new"
          aria-label={`${brand.name} — New idea`}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl">
            <img
              src="/Sparkle.webp"
              alt=""
              width={36}
              height={36}
              className="size-full object-cover"
            />
          </span>
          <span className="font-display text-xl leading-none">{brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="App">
          {navLinks.app.map((item) => {
            const Icon = appNavIcons[item.icon]
            const isActive = isAppRouteActive(pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-foreground"
                    : "text-foreground/65 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-3 -bottom-px h-px transition-opacity",
                    isActive ? "bg-primary opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/">Back to site</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/app/new">
              <Sparkles className="size-4" />
              New idea
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display">{brand.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile app">
                {navLinks.app.map((item) => {
                  const Icon = appNavIcons[item.icon]
                  const isActive = isAppRouteActive(pathname, item.to)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-foreground/75 hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  )
                })}
                <Button asChild className="mt-4 rounded-full">
                  <Link to="/">
                    <X className="size-4" />
                    Back to site
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
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
  if (to === "/app/dashboard") {
    return pathname === "/app/dashboard"
  }
  if (to === "/app/settings") {
    return pathname === "/app/settings"
  }
  return pathname.startsWith(to)
}

export function MobileAppTabBar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  return (
    <div className="fixed inset-x-0 bottom-3 z-40 px-3 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-full border border-border/60 bg-background/90 px-2 py-1.5 shadow-elevated backdrop-blur">
        {navLinks.appMobile.map((item) => {
          const active = isAppRouteActive(pathname, item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-12 items-center justify-center rounded-full px-3 text-[12px] font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// keep this export so the bottom-tab mobile bar can be conditionally rendered
export const _AppIcons = appNavIcons
