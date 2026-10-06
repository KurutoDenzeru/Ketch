import { cn } from "cn"
import type { ElementType, ReactNode } from "react"

/** The single page-width primitive: one gutter and one cap per route. */
const widths = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
} as const

type ContainerProps = {
  children: ReactNode
  width?: keyof typeof widths
  as?: ElementType
  className?: string
  /** Applies to the padded, max-width-limited column. */
  innerClassName?: string
}

export function Container({
  children,
  width = "default",
  as: Tag = "div",
  className,
  innerClassName,
}: ContainerProps) {
  return (
    <Tag
      data-slot="container"
      className={cn("w-full max-w-full overflow-x-hidden", className)}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col px-4 sm:px-6 lg:px-8",
          widths[width],
          innerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  )
}