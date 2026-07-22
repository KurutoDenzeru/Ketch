![Ketch](public/OpenGraph.webp)

✨ Idea workshop for instant brainstorming, local save/slug sharing, powered by React, TypeScript, Tailwind, TanStack Router, and shadcn/ui.

## ☁️ Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KurutoDenzeru/Ketch)
[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KurutoDenzeru/Ketch)

## ✨ Features

- **Idea Generator** — Generate creative brand ideas in real time from a seed prompt.
- **Idea Lab** — Create, evaluate, and refine idea briefs using AI-powered workflow components.
- **Saved Ideas** — Save and revisit high-potential ideas in a persistent local store.
- **Shared Ideas** — Share idea pages via self-contained URLs, no server needed.
- **Mobile + Desktop Nav** — Responsive tabbed navigation and top navbar with active-state routes.
- **Theme Switching** — Supports light/dark theme preference across devices.
- **Rate Limiting** — Built-in generation rate control to prevent misuse and keep request flow safe.
- **Accessible UI** — Uses shadcn-inspired components with keyboard-friendly controls.
- **Open Source** — MIT licensed; fully customizable and easy to fork.

## 🧱 Tech Stack

- [React](https://react.dev/): UI framework for declarative component rendering.
- [TanStack Router](https://tanstack.com/router): Declarative client-side routing with nested layouts.
- [TypeScript](https://www.typescriptlang.org/): Strong typing for safer maintenance and refactoring.
- [Tailwind](https://tailwindcss.com/): Utility-first styling used across components.
- [Shadcn UI](https://ui.shadcn.com/): Base design primitives for consistent interface components.

## 🚀 Getting Started

Clone the repo, install deps, and boot the dev server:

```bash
git clone https://github.com/KurutoDenzeru/Ketch.git
cd Ketch
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Build for Production

```bash
bun run build
bun start
```

## 🗂️ Configuration

The app is componentized under `src/`. Key areas to customize are:

```text
src/
  components/
    analysis/                 # Analysis dashboard sub-components
      trend-chart.tsx         # Trend visualization chart
      score-row.tsx           # Score display row
      tags-row.tsx            # Tags display row
      fit-and-ladder.tsx      # Fit & growth ladder analysis
      keyword-table.tsx       # Keyword analysis table
      proof-signals.tsx       # Proof signals display
      execution-timeline.tsx  # Execution timeline component
    analysis-dashboard.tsx    # Dashboard UI for performance analysis and data summary
    app-footer.tsx            # App footer with branding and links
    app-navbar.tsx            # Top/Bottom navigation menu components
    app-shell.tsx             # App layout shell wrapper
    idea-brief-form.tsx       # Form for drafting and scanning idea briefs
    idea-card.tsx             # UI card for idea previews and status controls
    pitch-section.tsx         # Pitch text generation and edit component
    reveal-on-scroll.tsx      # Scroll-triggered reveal animation wrapper
    score-ring.tsx            # Circular score visualization
    section-eyebrow.tsx       # Section eyebrow label component
    section-header.tsx        # Section header with title and description
    theme-provider.tsx        # Theme switcher context/provider logic
    theme-toggle-tabs.tsx     # UI toggles for theme select tabs
    ui/                       # shadcn/ui base components
  hooks/
    use-mobile.ts             # Mobile viewport detection hook
  lib/
    activity-log.ts           # Client-side activity tracking (localStorage)
    brand.ts                  # Brand config (name, tagline, social links)
    category-icons.ts         # Category icon mapping
    data-export.ts            # JSON/Markdown/Text export helpers
    dev.ts                    # Development utilities
    gemini.ts                 # AI generation + Gemini API integration
    generation-rate-limit.ts  # Generation request throttling helper
    idea-storage.ts           # Local storage helper for saved ideas
    query-client.ts           # React Query client setup
    seo.ts                    # SEO head tag builder
    shared-links.ts           # Shared link history management
    utils.ts                  # Shared utility functions
  routes/
    __root.tsx                # Root layout & global state wrapper
    index.tsx                 # Marketing landing page
    app.new.tsx               # Idea generation route
    app.library.tsx           # Library listing route
    app.library_.$id.tsx      # Library idea detail route
    app.settings.tsx          # Settings page route
    share.$slug.tsx           # Shared idea view route
    idea.$slug.tsx            # Legacy shared idea route
    $.tsx                     # 404 catch-all route
    api/                      # API utilities and helpers
  types/
    idea.ts                   # Idea domain model typings
    rate-limit.ts             # Rate limiting typings
```

## 🤝🏻 Contributing

Contributions are always welcome, whether you’re fixing bugs, improving docs, or shipping new features that make the project better for everyone.

Check out [Contributing.md](Contributing) to learn how to get started and follow the recommended workflow.

<!-- Please adhere to this project's `Code of Conduct`. -->

## ⚖️ License

This project is released under the MIT License, giving you the freedom to use, modify, and distribute the code with minimal restrictions.

For the full legal text, see the [MIT](LICENSE) file.
