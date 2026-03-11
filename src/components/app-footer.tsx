import { Github, Instagram, Linkedin } from "lucide-react"

import { ThemeToggleTabs } from "@/components/theme-toggle-tabs"

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">Ketch</p>
          <p>Copyright {new Date().getFullYear()} All Rights Reserved</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggleTabs />
          <a
            href="https://github.com/KurutoDenzeru/Ketch"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 shadow-sm transition-colors hover:bg-muted/60"
          >
            <Github className="size-4" />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/kurtcalacday/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 shadow-sm transition-colors hover:bg-muted/60"
          >
            <Linkedin className="size-4" />
            LinkedIn
          </a>
          <a
            href="https://instagram.com/krtclcdy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 shadow-sm transition-colors hover:bg-muted/60"
          >
            <Instagram className="size-4" />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
