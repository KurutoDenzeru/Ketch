import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Camera, Code2, Hash } from "lucide-react"

import { Container } from "@/components/container"
import { ThemeToggleTabs } from "@/components/theme-toggle-tabs"
import { brand } from "@/lib/brand"

const productLinks = [
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

const socialLinks = [
  { label: "GitHub", href: brand.github, Icon: Code2 },
  { label: "LinkedIn", href: brand.linkedin, Icon: Hash },
  { label: "Instagram", href: brand.instagram, Icon: Camera },
]

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/85">
      <Container width="wide" innerClassName="flex-row flex-wrap items-center justify-between gap-3 py-8">
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
      </Container>

      <Container width="wide" innerClassName="border-t border-border/60 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10 lg:gap-14">
          <div className="space-y-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="inline-flex size-11 items-center justify-center overflow-hidden rounded-xl">
                <img
                  src="/Sparkle.webp"
                  alt=""
                  width={44}
                  height={44}
                  className="size-full object-cover"
                />
              </span>
              <span className="font-display text-3xl leading-none font-semibold tracking-[-0.02em]">
                {brand.name}
              </span>
            </Link>
            <p className="max-w-sm font-display text-[clamp(1.35rem,2.2vw,1.875rem)] leading-[1.14] tracking-[-0.02em] text-balance">
              Turn a rough brief into a memo worth arguing about.
            </p>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              {brand.shortDescription}
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 Barcoda. {brand.authorHandle}. All rights reserved.
            </p>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Product
            </p>
            <ul className="space-y-4 text-sm">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Company
            </p>
            <ul className="space-y-4 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="size-3 opacity-0 transition-opacity duration-500 group-hover:opacity-60"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="lift inline-flex size-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted/60"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
