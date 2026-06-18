import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

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
        "flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-14 text-center",
        variant === "dashed"
          ? "border border-dashed border-border/70 bg-muted/20"
          : "border border-border/60 bg-card/80 shadow-xs",
        className
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="space-y-2">
        <h3 className="font-display text-2xl leading-tight">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}
