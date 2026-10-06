export const brand = {
  name: "Ketch",
  tagline: "Generate startup ideas worth pursuing.",
  shortDescription:
    "A founder-first AI workshop that turns rough briefs into a scored, shareable idea memo.",
  author: "Kurt Calacday",
  authorHandle: "KurutoDenzeru",
  github: "https://github.com/KurutoDenzeru/Ketch",
  linkedin: "https://linkedin.com/in/kurtcalacday/",
  instagram: "https://instagram.com/krtclcdy",
} as const

export const navLinks = {
  app: [
    { label: "New", to: "/app/new", icon: "Sparkles" as const },
    { label: "Library", to: "/app/library", icon: "Bookmark" as const },
    { label: "Settings", to: "/app/settings", icon: "Settings" as const },
  ],
} as const
