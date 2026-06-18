export const brand = {
  name: "Ketch",
  tagline: "Generate startup ideas worth pursuing.",
  shortDescription:
    "A founder-first AI workshop that turns rough briefs into opportunity scoring, market timing, shareable reports, and execution plans.",
  author: "Kurt Calacday",
  authorHandle: "KurutoDenzeru",
  github: "https://github.com/KurutoDenzeru/Ketch",
  linkedin: "https://linkedin.com/in/kurtcalacday/",
  instagram: "https://instagram.com/krtclcdy",
} as const

export const navLinks = {
  marketing: [
    { label: "How it works", href: "#how-it-works" },
    { label: "What you get", href: "#what-you-get" },
    { label: "FAQ", href: "#faq" },
  ],
  app: [
    { label: "New idea", to: "/app/new", icon: "Sparkles" as const },
    { label: "Library", to: "/app/library", icon: "Bookmark" as const },
    { label: "Settings", to: "/app/settings", icon: "Settings" as const },
  ],
  appMobile: [
    { label: "New", to: "/app/new" },
    { label: "Library", to: "/app/library" },
    { label: "Settings", to: "/app/settings" },
  ],
} as const
