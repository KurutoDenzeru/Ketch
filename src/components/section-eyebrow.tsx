import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type SectionEyebrowProps = {
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function SectionEyebrow({ icon: Icon, children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[11px] leading-none font-semibold tracking-[0.2em] text-muted-foreground uppercase",
        className
      )}
    >
      {Icon ? (
        <Icon className="size-3.5 text-primary/80" aria-hidden="true" />
      ) : null}
      {children}
    </p>
  )
}
