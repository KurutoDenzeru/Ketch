import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

import { gsap, prefersReducedMotion } from "@/components/motion/motion"

type StaggerGroupProps = {
  children: ReactNode
  className?: string
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

/** Sequences its `StaggerItem` descendants into view on scroll. */
export function StaggerGroup({ children, className }: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const group = ref.current
    if (!group || typeof window === "undefined" || prefersReducedMotion()) {
      return
    }

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(
        "[data-stagger-item]",
        group
      )
      if (items.length === 0) {
        return
      }

      gsap.set(items, { autoAlpha: 0, y: 32 })
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "transform",
        scrollTrigger: {
          trigger: group,
          start: "top 85%",
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Marks a node as one step of the enclosing `StaggerGroup` sequence. */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <div data-stagger-item className={className}>
      {children}
    </div>
  )
}
