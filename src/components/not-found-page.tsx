import { Link } from "@tanstack/react-router"
import { Compass, Library } from "lucide-react"

import { Container } from "@/components/container"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { SplitHeading } from "@/components/motion/split-heading"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <Container width="narrow" innerClassName="items-center py-24 text-center md:py-32">
      <ScrollReveal className="flex flex-col items-center gap-6">
        <p
          className="font-mono text-sm text-muted-foreground tabular-nums"
          aria-hidden="true"
        >
          404
        </p>
        <SplitHeading
          as="h1"
          text="Ketch lost the thread."
          className="max-w-[13ch] font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.98] tracking-[-0.035em] text-balance"
        />
        <p className="max-w-lg text-base leading-8 text-muted-foreground text-pretty">
          Nothing lives at this address. If you arrived from a shared idea link,
          the snapshot may have been revoked or opened on a different device.
          Otherwise, head back to the lab and start a fresh brief.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/app/new">
              <Compass className="size-4" aria-hidden="true" />
              Open the lab
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/app/library">
              <Library className="size-4" aria-hidden="true" />
              Library
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </Container>
  )
}