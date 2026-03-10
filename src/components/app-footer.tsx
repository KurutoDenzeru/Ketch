import { Github, Instagram, Linkedin } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">AI Startup Idea Lab</p>
          <p>Copyright {new Date().getFullYear()} All Rights Reserved</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 transition-colors hover:bg-muted/60"
          >
            <Github className="size-4" />
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 transition-colors hover:bg-muted/60"
          >
            <Linkedin className="size-4" />
            LinkedIn
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 transition-colors hover:bg-muted/60"
          >
            <Instagram className="size-4" />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
