import { Link } from "@tanstack/react-router"
import { Github, Instagram, Linkedin } from "lucide-react"

import { ThemeToggleTabs } from "@/components/theme-toggle-tabs"
import { brand } from "@/lib/brand"

const productLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Sample report", href: "/#what-you-get" },
  { label: "Open the lab", to: "/app/new" as const },
  { label: "Library", to: "/app/library" as const },
  { label: "Settings", to: "/app/settings" as const },
]

const companyLinks = [
  { label: "GitHub", href: brand.github, external: true },
  { label: "LinkedIn", href: brand.linkedin, external: true },
  { label: "Instagram", href: brand.instagram, external: true },
  {
    label: "Contributing",
    href: "https://github.com/KurutoDenzeru/Ketch/blob/main/Contributing.md",
    external: true,
  },
  { label: "License", href: "https://github.com/KurutoDenzeru/Ketch/blob/main/LICENSE", external: true },
]

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/85">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          All systems operational
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Theme
          </span>
          <ThemeToggleTabs />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t border-border/60 px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Link
              to="/"
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
              <span className="font-display text-lg leading-none">{brand.name}</span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              {brand.shortDescription}
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {brand.name} by {brand.author}.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Product
            </p>
            <ul className="space-y-2 text-sm">
              {productLinks.map((link) =>
                "to" in link && link.to ? (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Company
            </p>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="text-muted-foreground">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <a
                href={brand.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted/60"
              >
                <Github className="size-4" />
              </a>
              <a
                href={brand.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted/60"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted/60"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
