import { BadgeCheck, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SectionEyebrow } from "@/components/section-eyebrow"

type TagsRowProps = {
  tags: Array<string>
}

export function TagsRow({ tags }: TagsRowProps) {
  if (tags.length === 0) {
    return null
  }
  return (
    <div className="space-y-3">
      <SectionEyebrow icon={Tag}>Tags</SectionEyebrow>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
          >
            <BadgeCheck className="size-3.5 text-primary" />
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
