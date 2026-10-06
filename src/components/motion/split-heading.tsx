import { cn } from "cn"
import { createElement, useEffect, useRef } from "react"
import type { ReactNode } from "react"

import { gsap, prefersReducedMotion } from "@/components/motion/motion"

type SplitHeadingProps = {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p"
  /** First word index that carries the flashing gradient fill; unset leaves every word plain. */
  flashFrom?: number
  /** "in" plays one entrance on mount; "scroll" scrubs the reveal against the viewport. */
  trigger?: "in" | "scroll"
}

const WORD_SELECTOR = "[data-split-word]"

/** Word-by-word reveal; word spans are inline-block so each animates on its own. */
export function SplitHeading({
  text,
  className,
  as = "h2",
  flashFrom,
  trigger = "scroll",
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement | null>(null)
  const words = text.split(" ")

  useEffect(() => {
    const heading = ref.current
    if (!heading || typeof window === "undefined") {
      return
    }

    const targets = heading.querySelectorAll<HTMLElement>(WORD_SELECTOR)
    if (targets.length === 0) {
      return
    }

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, filter: "none" })
      return
    }

    const ctx = gsap.context(() => {
      if (trigger === "in") {
        gsap.set(targets, { opacity: 0, yPercent: 55, filter: "blur(12px)" })
        gsap.to(targets, {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.065,
          delay: 0.12,
          clearProps: "transform,filter",
        })
        return
      }

      gsap.set(targets, { opacity: 0.12, filter: "blur(6px)" })
      gsap.to(targets, {
        opacity: 1,
        filter: "blur(0px)",
        // Scrub span scales with word count so long headings do not race past.
        duration: Math.min(1.4 + targets.length * 0.12, 4),
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          end: "bottom 45%",
          scrub: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [text, trigger])

  const children: Array<ReactNode> = words.map((word, index) => (
    <span key={`${index}-${word}`}>
      <span
        data-split-word=""
        className={cn(
          "inline-block",
          flashFrom !== undefined && index >= flashFrom && "flash-text"
        )}
      >
        {word}
      </span>
      {index < words.length - 1 ? " " : null}
    </span>
  ))

  return createElement(as, { className, ref }, children)
}
