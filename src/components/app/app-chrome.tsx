import { cn } from "cn"
import { useEffect, useRef } from "react"
import type { ComponentProps, ReactNode } from "react"

import { ArtField } from "@/components/art-field"
import { Container } from "@/components/container"
import { gsap, prefersReducedMotion } from "@/components/motion/motion"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { SplitHeading } from "@/components/motion/split-heading"

/** Shared page chrome for the app routes; the column uses the footer's `wide` tier. */
export function AppPage({
  children,
  className,
  width = "wide",
  innerClassName,
}: {
  children: ReactNode
  className?: string
  width?: "narrow" | "default" | "wide"
  innerClassName?: string
}) {
  return (
    <Container
      width={width}
      className={className}
      innerClassName={cn("py-8 md:py-12", innerClassName)}
    >
      {children}
    </Container>
  )
}

/** The one card treatment used across every app route. */
export function AppCard({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm transition-[border-color,box-shadow] duration-700 ease-out hover:border-foreground/20 hover:shadow-md sm:p-6 md:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Page masthead: wide flashing headline over a light-swept stage, with a parallax contour field. */
export function AppMasthead({
  eyebrow,
  title,
  accent,
  description,
  actions,
  meta,
  art = "memo",
}: {
  eyebrow: string
  title: string
  accent: string
  description: string
  actions?: ReactNode
  meta?: ReactNode
  art?: string
}) {
  const stageRef = useRef<HTMLElement | null>(null)
  const artRef = useRef<HTMLDivElement | null>(null)
  const heading = accent.trim() ? `${title} ${accent}` : title
  const flashFrom = accent.trim() ? title.trim().split(/\s+/).length : undefined

  useEffect(() => {
    const stage = stageRef.current
    const artLayer = artRef.current
    if (!stage || !artLayer || typeof window === "undefined") {
      return
    }
    if (
      prefersReducedMotion() ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return
    }

    const driftX = gsap.quickTo(artLayer, "x", {
      duration: 1.2,
      ease: "power3.out",
    })
    const driftY = gsap.quickTo(artLayer, "y", {
      duration: 1.2,
      ease: "power3.out",
    })

    const handlePointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      driftX(((event.clientX - rect.left) / rect.width - 0.5) * 36)
      driftY(((event.clientY - rect.top) / rect.height - 0.5) * 28)
    }
    const handlePointerEnter = () => {
      gsap.to(artLayer, { scale: 1.06, duration: 1.4, ease: "power3.out" })
    }
    const handlePointerLeave = () => {
      driftX(0)
      driftY(0)
      gsap.to(artLayer, { scale: 1, duration: 1.4, ease: "power3.out" })
    }

    stage.addEventListener("pointermove", handlePointerMove)
    stage.addEventListener("pointerenter", handlePointerEnter)
    stage.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      stage.removeEventListener("pointermove", handlePointerMove)
      stage.removeEventListener("pointerenter", handlePointerEnter)
      stage.removeEventListener("pointerleave", handlePointerLeave)
      gsap.killTweensOf(artLayer)
    }
  }, [])

  return (
    <ScrollReveal>
      <header ref={stageRef} className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
        >
          <div className="hero-beam" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: [
                "linear-gradient(to right, color-mix(in oklch, var(--foreground) 14%, transparent) 1px, transparent 1px)",
                "linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 14%, transparent) 1px, transparent 1px)",
              ].join(","),
              backgroundSize: "58px 58px",
              maskImage:
                "radial-gradient(70% 60% at 18% 0%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(70% 60% at 18% 0%, black, transparent)",
            }}
          />
        </div>
        <div
          ref={artRef}
          aria-hidden="true"
          className="mask-fade-l pointer-events-none absolute -top-1/3 -right-[18%] -z-10 h-[150%] w-[92%] opacity-60 will-change-transform sm:-right-[12%] sm:w-[72%] lg:-right-[8%] lg:w-[56%]"
        >
          <ArtField slug={art} className="size-full" />
        </div>
        <div className="flex flex-col gap-7 py-2 md:py-4">
          <div className="flex flex-col gap-4">
            <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border/60 bg-card/50 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase backdrop-blur">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              {eyebrow}
            </p>
            <SplitHeading
              text={heading}
              as="h1"
              trigger="in"
              flashFrom={flashFrom}
              className="w-full max-w-6xl font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance"
            />
            <p className="max-w-2xl text-base leading-7 text-pretty text-muted-foreground md:text-lg md:leading-8">
              {description}
            </p>
          </div>
          {meta || actions ? (
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-border/60 pt-6">
              {meta}
              {actions ? (
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
    </ScrollReveal>
  )
}
