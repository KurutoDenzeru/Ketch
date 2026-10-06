import { cn } from "cn"
import type { ReactNode } from "react"

type SectionHeaderProps = {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: "start" | "center"
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className
      )}
    >
      {eyebrow ? (
        <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h2
        className={cn(
          "font-display text-[clamp(1.9rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.028em] text-balance",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-lg leading-8 text-muted-foreground text-pretty",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
