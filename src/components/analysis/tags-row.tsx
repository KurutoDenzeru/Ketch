import { Tag } from "lucide-react"

type TagsRowProps = {
  tags: Array<string>
}

export function TagsRow({ tags }: TagsRowProps) {
  if (tags.length === 0) {
    return null
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        <Tag className="size-3.5" aria-hidden="true" />
        Tags
      </p>
      <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {tags.map((tag) => (
          <li
            key={tag}
            className="border-b border-border/70 pb-0.5 text-sm text-foreground/80 transition-colors duration-500 hover:border-primary hover:text-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  )
}