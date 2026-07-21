import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionEyebrowProps = {
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function SectionEyebrow({ icon: Icon, children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {children}
    </p>
  )
}
