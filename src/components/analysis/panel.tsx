import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

/** Shared chrome for every analysis panel: one radius, hairline, and surface. */
export function Panel({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 shadow-sm transition-[border-color,box-shadow] duration-700 ease-out hover:border-foreground/15",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelBody({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("p-5 sm:p-6 md:p-7", className)} {...props}>
      {children}
    </div>
  )
}

type PanelHeadingProps = {
  icon?: LucideIcon
  label: string
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function PanelHeading({
  icon: Icon,
  label,
  title,
  description,
  action,
  className,
}: PanelHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
          {label}
        </p>
        <h3 className="font-display text-xl leading-tight text-balance sm:text-2xl">{title}</h3>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-muted-foreground text-pretty">
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  )
}

const strengthTone: Record<string, string> = {
  high: "bg-brand-green",
  medium: "bg-brand-gold",
  low: "bg-destructive",
}

const strengthWord: Record<string, string> = {
  high: "Strong",
  medium: "Mixed",
  low: "Thin",
}

/** Compact five-notch strength meter shared by score and proof panels. */
export function StrengthMeter({
  level,
  className,
}: {
  level: "high" | "medium" | "low"
  className?: string
}) {
  const filled = level === "high" ? 5 : level === "medium" ? 3 : 1
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className={cn(
              "w-1 rounded-full",
              index < filled ? strengthTone[level] : "bg-border"
            )}
            style={{ height: `${6 + index * 2.5}px` }}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {strengthWord[level]}
      </span>
    </span>
  )
}