import type { ReactNode } from "react"

import { Ambient } from "@/components/ambient"
import { AppFooter } from "@/components/app-footer"
import { AppNavbar } from "@/components/app-navbar"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <Ambient />
      <div className="grain-overlay" aria-hidden="true" />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AppNavbar />
      <div id="main-content" className="flex-1 pb-24 md:pb-12">
        {children}
      </div>
      <AppFooter />
    </div>
  )
}
