import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

import { gsap, prefersReducedMotion } from "@/components/motion/motion"

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

/** Fade-and-lift entrance; GSAP applies the hidden start state, so SSR markup stays visible. */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined" || prefersReducedMotion()) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0, y: 24 })
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay: delay / 1000,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
