import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: "start" | "center"
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className
      )}
    >
      {eyebrow ? <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</div> : null}
      <h2 className="font-display text-3xl leading-[1.05] text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}
