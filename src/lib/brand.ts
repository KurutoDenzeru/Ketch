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
  marketing: [
    { label: "How it works", href: "#how-it-works", icon: "Compass" as const },
    { label: "What you get", href: "#what-you-get", icon: "LineChart" as const },
    { label: "FAQ", href: "#faq", icon: "HelpCircle" as const },
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
