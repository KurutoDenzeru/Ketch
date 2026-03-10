import { Sparkles } from "lucide-react"

import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type NameSuggestionsProps = {
  names: string[]
  selectedName: string
  onSelect: (name: string) => void
}

export function NameSuggestions({
  names,
  selectedName,
  onSelect,
}: NameSuggestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        <Sparkles className="size-3.5" />
        Alternative Names
      </div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => {
          const isSelected = name === selectedName

          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className={cn(
                badgeVariants({ variant: isSelected ? "default" : "outline" }),
                "h-auto cursor-pointer px-3 py-1.5 transition-transform hover:-translate-y-0.5"
              )}
            >
              {name}
            </button>
          )
        })}
      </div>
      <Badge
        variant="outline"
        className="h-auto rounded-full px-3 py-1 text-[11px] tracking-[0.14em] uppercase"
      >
        Tap a badge to swap the active startup name
      </Badge>
    </div>
  )
}
