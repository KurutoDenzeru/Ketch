import { cn } from "cn"
import type { ReactNode } from "react"

type EmptyStateProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  variant?: "default" | "dashed"
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-3xl px-6 py-24 text-center md:py-32",
        variant === "dashed"
          ? "border border-dashed border-border/70 bg-muted/20"
          : "border border-border/60 bg-card/70 shadow-sm",
        className
      )}
    >
      {icon ? <div className="text-muted-foreground/70">{icon}</div> : null}
      <div className="max-w-xl space-y-4">
        <h3 className="font-display text-3xl leading-tight text-balance md:text-4xl">
          {title}
        </h3>
        {description ? (
          <p className="text-base leading-8 text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}