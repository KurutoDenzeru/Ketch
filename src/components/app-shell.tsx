import type { ReactNode } from "react"

import { AppFooter } from "@/components/app-footer"
import { AppNavbar } from "@/components/app-navbar"

type AppShellProps = {
  children: ReactNode
  variant: "marketing" | "app"
}

export function AppShell({ children, variant }: AppShellProps) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <div className="grain-overlay" aria-hidden="true" />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AppNavbar variant={variant} />
      <div
        id="main-content"
        className={
          variant === "app"
            ? "flex-1 px-0 pb-24 pt-3 md:pb-12 md:pt-20"
            : "flex-1 px-0 pt-16 md:pt-20"
        }
      >
        {children}
      </div>
      <AppFooter />
    </div>
  )
}
