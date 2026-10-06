import { useEffect, useRef } from "react"

import { prefersReducedMotion } from "@/components/motion/motion"

/** Decorative SVG art drawn from brand tokens; each slug produces deterministic geometry. */
const palettes: Record<string, { from: string; to: string; line: string }> = {
  brief: { from: "var(--primary)", to: "var(--brand-gold)", line: "var(--primary)" },
  memo: { from: "var(--brand-blue)", to: "var(--primary)", line: "var(--brand-blue)" },
  loop: { from: "var(--primary)", to: "var(--brand-green)", line: "var(--primary)" },
  draft: { from: "var(--brand-gold)", to: "var(--primary)", line: "var(--brand-gold)" },
}

/** Stable pseudo-random in [0,1) from a string seed and an index. */
function rand(seed: string, index: number): number {
  let h = 2166136261
  const key = `${seed}:${index}`
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

/** A drifting contour field: concentric distorted rings, rendered as SVG paths. */
export function ArtField({ slug, className }: { slug: string; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const palette = palettes[slug] ?? palettes.memo

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined" || prefersReducedMotion()) {
      return
    }
    const layers = el.querySelectorAll<HTMLElement>("[data-art-layer]")
    if (layers.length === 0) {
      return
    }
    let frame = 0
    let start = 0
    const step = (now: number) => {
      if (!start) {
        start = now
      }
      const t = (now - start) / 1000
      layers.forEach((layer, index) => {
        const phase = rand(slug, index) * Math.PI * 2
        layer.style.transform = `translate3d(${Math.sin(t * 0.22 + phase) * 10}px, ${Math.cos(t * 0.18 + phase) * 8}px, 0) scale(${1 + Math.sin(t * 0.15 + phase) * 0.02})`
      })
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [slug])

  const rings = Array.from({ length: 6 }, (_, i) => i)

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 400 500" className="size-full" role="presentation">
        <defs>
          <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        {rings.map((i) => {
          const cx = 200 + (rand(slug, i) - 0.5) * 90
          const cy = 250 + (rand(slug, i + 20) - 0.5) * 90
          const r = 46 + i * 30 + rand(slug, i + 40) * 18
          const wobble = 1 + (rand(slug, i + 60) - 0.5) * 0.3
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r}
              ry={r * wobble}
              fill="none"
              stroke={`url(#grad-${slug})`}
              strokeWidth={i === 0 ? 1.4 : 0.7}
              opacity={0.16 + (5 - i) * 0.11}
              data-art-layer=""
              transform={`rotate(${rand(slug, i + 80) * 60 - 30} ${cx} ${cy})`}
            />
          )
        })}
        <circle
          cx={200}
          cy={250}
          r={7}
          fill={palette.line}
          opacity={0.7}
          data-art-layer=""
        />
      </svg>
    </div>
  )
}