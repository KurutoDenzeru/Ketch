import { cn } from "@/lib/utils"

type ScoreRingProps = {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  tone?: "primary" | "muted" | "success" | "warning" | "danger"
  className?: string
}

const toneMap: Record<NonNullable<ScoreRingProps["tone"]>, { stroke: string; text: string }> = {
  primary: {
    stroke: "stroke-primary",
    text: "text-foreground",
  },
  muted: {
    stroke: "stroke-muted-foreground/40",
    text: "text-muted-foreground",
  },
  success: {
    stroke: "stroke-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    stroke: "stroke-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    stroke: "stroke-rose-500",
    text: "text-rose-600 dark:text-rose-400",
  },
}

export function ScoreRing({
  value,
  max = 10,
  size = 96,
  strokeWidth = 8,
  label,
  tone = "primary",
  className,
}: ScoreRingProps) {
  const safeValue = Math.max(0, Math.min(value, max))
  const ratio = safeValue / max
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ratio)
  const palette = toneMap[tone]

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Score ${safeValue} of ${max}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border/70"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", palette.stroke)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("font-display leading-none tabular-nums", palette.text)}
          style={{ fontSize: size * 0.34 }}
        >
          {Math.round(safeValue)}
        </span>
        <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {max === 10 ? "/ 10" : `/ ${max}`}
        </span>
      </div>
    </div>
  )
}
