import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Cpu,
  Database,
  Globe,
  Lightbulb,
  LineChart,
  Package,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Wallet,
  Workflow,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionHeader } from "@/components/section-header"
import { brand } from "@/lib/brand"
import { buildSeoHead, defaultSeo } from "@/lib/seo"

export const Route = createFileRoute("/")({
  head: () =>
    buildSeoHead({
      path: "/",
      title: defaultSeo.title,
      description: defaultSeo.description,
      keywords: defaultSeo.keywords,
      imageAlt: "Ketch AI Startup Idea Lab social preview",
    }),
  component: MarketingLanding,
})

const howItWorks: Array<{ step: string; title: string; body: string; icon: LucideIcon }> = [
  {
    step: "01",
    title: "Describe the founder context.",
    body: "A short brief on the problem, audience, and the category you want to explore. Two minutes, three sentences is enough.",
    icon: Lightbulb,
  },
  {
    step: "02",
    title: "Generate, score, and pressure-test.",
    body: "Ketch returns a full startup memo: opportunity scoring, market timing, proof signals, keyword trends, and a phased execution plan.",
    icon: Target,
  },
  {
    step: "03",
    title: "Save, refine, and share.",
    body: "Iterate on names, generate a pitch, run a YC-style reality check, and share a public link when you're ready for feedback.",
    icon: Share2,
  },
]

const whatYouGet: Array<{
  eyebrow: string
  title: string
  body: string
  icon: LucideIcon
  bullets: Array<string>
}> = [
  {
    eyebrow: "Opportunity scoring",
    title: "Four KPIs you can quote in a pitch.",
    body: "Validation score, timing, defensibility, and demand shown as a single glanceable row — no spreadsheet required.",
    icon: LineChart,
    bullets: [
      "10-point scale tuned for solo founders",
      "Per-dimension insight one-liner",
      "Refined score is reproducible per idea",
    ],
  },
  {
    eyebrow: "Market timing",
    title: "A trend curve tied to a real keyword.",
    body: "Switch between search terms and watch the curve update. See current volume, growth, and the slope the model is reading from.",
    icon: Timer,
    bullets: [
      "Seven-window search trend",
      "Volume + growth in one panel",
      "Keyword picker drawn from the analysis",
    ],
  },
  {
    eyebrow: "Execution plan",
    title: "A four-phase build path.",
    body: "Each idea comes with objective, action list, timeframe, and a measurable outcome. Enough to start a Monday.",
    icon: Workflow,
    bullets: [
      "Phased rollout with timeframes",
      "Action lists, not slogans",
      "Outcome KPIs per phase",
    ],
  },
  {
    eyebrow: "Shareable reports",
    title: "A public link for every idea.",
    body: "Every idea you generate can be shared as a single URL — no account, no signup, no Paywall. Paste it in a DM.",
    icon: Globe,
    bullets: [
      "Slug-based public URL",
      "Recent list of shared links",
      "Copy as text, markdown, or AI prompt",
    ],
  },
]

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: "Do I need an account to use Ketch?",
    a: "No. Ketch is local-first. Your saved ideas, brief drafts, and shared link history live in this browser. Nothing leaves the device unless you explicitly share a link or export JSON.",
  },
  {
    q: "What model powers the generation?",
    a: "Ketch uses Google Gemini for the heavy lifting — idea framing, scoring, market validation, and pitch drafting. The brief stays small and structured to keep the responses grounded.",
  },
  {
    q: "How is the validation score calculated?",
    a: "It's a blend of four signals: timing (trend curve), defensibility (competition framing), opportunity (audience-product fit), and execution (realism of the phased plan). Scores are tempered to stay inside a 1-10 band.",
  },
  {
    q: "Can I share an idea without saving it?",
    a: "Yes. The Share button on any idea creates a public link immediately. Saved ideas add the same snapshot to your Library, and a recently-viewed entry to anyone who opens the link.",
  },
  {
    q: "Is there a rate limit?",
    a: "To keep generation fair across users, Ketch applies a weekly cap shown in the Idea Lab. The cap is generous; you'll see remaining credits next to the Generate button.",
  },
  {
    q: "What happens to my data if I clear my browser?",
    a: "Your saved ideas, the brief draft, and recent shared links all live in localStorage and will be cleared. To move data between browsers, use the Export / Import buttons in Settings.",
  },
]

const trustStrip: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Powered by Gemini", icon: Cpu },
  { label: "Open source", icon: Package },
  { label: "Local-first", icon: Database },
  { label: "No account needed", icon: ShieldCheck },
]

const sampleRow = [
  { label: "Validation", value: 8.4 },
  { label: "Timing", value: 7.2 },
  { label: "Defensibility", value: 6.8 },
  { label: "Demand", value: 8.9 },
]

const sampleTrend = [
  { label: "Mar", value: 42 },
  { label: "Apr", value: 48 },
  { label: "May", value: 51 },
  { label: "Jun", value: 58 },
  { label: "Jul", value: 63 },
  { label: "Aug", value: 71 },
  { label: "Sep", value: 78 },
]

function MarketingLanding() {
  return (
    <main className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 md:px-6 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-28">
          <div className="space-y-7 text-balance">
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[12px] font-medium text-foreground/80 shadow-xs backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                New: unified library
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                Generate startup ideas
                <span className="block italic text-primary">worth pursuing.</span>
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delay={160}>
              <p className="max-w-xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg">
                {brand.shortDescription}
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={240}>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link to="/app/new">
                    Open the lab
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                  <a href="#what-you-get">
                    See a sample report
                  </a>
                </Button>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={320}>
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <li className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  No signup
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  Local-first
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  Free while in beta
                </li>
              </ul>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={200} className="relative">
            <HeroMockup />
          </RevealOnScroll>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border/60 bg-background/40 py-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 md:px-6">
          {trustStrip.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
            >
              <Icon className="size-4" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-border/60 py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 md:px-6">
          <SectionHeader
            eyebrow="How it works"
            title={
              <>
                Three steps from rough
                <span className="italic text-primary"> idea to memo.</span>
              </>
            }
            description="A focused workspace for founders. You bring the brief, Ketch handles the structure, scoring, and the shareable report."
          />
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <RevealOnScroll className="lg:row-span-2">
              <Card className="h-full rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
                <CardContent className="flex h-full flex-col gap-6 p-7">
                  <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="size-3.5" /> 01 · Brief
                    </span>
                    <span>~ 2 min</span>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl leading-tight">
                      Start with a founder angle, not a feature list.
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Pick a category, write a problem statement, name the
                      audience. Ketch will steer the rest with focused toggles
                      for category focus and desired features.
                    </p>
                  </div>
                  <div className="mt-auto space-y-3 rounded-2xl border border-border/60 bg-background/80 p-5">
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                      Example brief
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="mt-1 text-sm font-medium">AI Tool</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Audience</p>
                        <p className="mt-1 text-sm font-medium">Independent agencies</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Problem</p>
                        <p className="mt-1 text-sm font-medium">
                          Briefs die in Slack threads. Briefs need a structured
                          first draft.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RevealOnScroll>
            {howItWorks.slice(1).map((step, index) => (
              <RevealOnScroll key={step.title} delay={index * 80}>
                <Card className="h-full rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
                  <CardContent className="flex h-full flex-col gap-5 p-7">
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                      <span className="inline-flex items-center gap-2">
                        <step.icon className="size-3.5" /> {step.step}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {step.body}
                    </p>
                  </CardContent>
                </Card>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET (zig-zag) */}
      <section id="what-you-get" className="py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 md:px-6">
          <SectionHeader
            eyebrow="What you get"
            title={
              <>
                A real memo, not a
                <span className="italic text-primary"> vibe check.</span>
              </>
            }
            description="Every generated idea comes back as a structured report you can use in a pitch, share in a DM, or hand to a co-founder."
          />
          {whatYouGet.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 60}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="space-y-4">
                  <SectionEyebrow icon={item.icon}>{item.eyebrow}</SectionEyebrow>
                  <h3 className="font-display text-3xl leading-tight sm:text-4xl">
                    {item.title}
                  </h3>
                  <p className="max-w-lg text-base leading-7 text-muted-foreground">
                    {item.body}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-foreground/80">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
                    <CardContent className="space-y-5 p-7">
                      {index === 0 ? <SampleScores /> : null}
                      {index === 1 ? <SampleTrend /> : null}
                      {index === 2 ? <SampleExecution /> : null}
                      {index === 3 ? <SampleShare /> : null}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* LIBRARY PREVIEW */}
      <section className="border-y border-border/60 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-6">
          <SectionHeader
            eyebrow="Library"
            title={
              <>
                Everything you generated,
                <span className="italic text-primary"> kept nearby.</span>
              </>
            }
            description="The Library holds every idea you've saved, every link you've shared, and every shared idea you've opened — searchable, sortable, and exportable from any device."
          />
          <RevealOnScroll>
            <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 py-0 shadow-xs">
              <CardContent className="space-y-6 p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                      Library · saved
                    </p>
                    <h3 className="font-display text-2xl leading-tight">
                      14 ideas ready to revisit
                    </h3>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link to="/app/library">
                      Open library <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { name: "Mosaic Health", cat: "Healthcare", score: 8.4 },
                    { name: "Trellis Studio", cat: "Creator Tool", score: 7.6 },
                    { name: "Beacon Inventory", cat: "Dev Tool", score: 8.1 },
                    { name: "Civic Sounding", cat: "Consumer Social", score: 7.2 },
                  ].map((idea) => (
                    <div
                      key={idea.name}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/85 p-4"
                    >
                      <div>
                        <p className="font-medium leading-tight">{idea.name}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{idea.cat}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full font-mono text-[11px]">
                          {idea.score}/10
                        </Badge>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-6 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <SectionHeader
              eyebrow="FAQ"
              title="Honest answers, no marketing."
            />
          </div>
          <div className="md:flex-1">
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border border-border/60 bg-card/80"
            >
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.q}
                  value={item.q}
                  className="border-border/60 px-5 last:border-b-0"
                >
                  <AccordionTrigger className="py-4 text-sm font-medium text-foreground hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-24">
          <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            No signup. Just describe the problem.
          </h2>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Bring a rough idea, a competitor you want to outdo, or an audience
            you understand. Leave with a structured memo and a shareable link.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/app/new">
                <Rocket className="size-4" />
                Start a brief
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link to="/app/library">
                <Bookmark className="size-4" />
                Browse library
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function SampleScores() {
  return (
    <div className="space-y-5">
      <SectionEyebrow icon={BarChart3}>Opportunity scoring</SectionEyebrow>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sampleRow.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-border/60 bg-background/85 p-4 text-center"
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {row.label}
            </p>
            <p className="mt-2 font-display text-3xl leading-none tabular-nums">
              {row.value}
              <span className="text-sm text-muted-foreground">/10</span>
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Synthetic demo data. Real scores come from your brief.
      </p>
    </div>
  )
}

function SampleTrend() {
  const max = Math.max(...sampleTrend.map((p) => p.value))
  return (
    <div className="space-y-5">
      <SectionEyebrow icon={LineChart}>Market timing</SectionEyebrow>
      <div className="rounded-2xl border border-border/60 bg-background/85 p-5">
        <div className="flex h-32 items-stretch gap-2">
          {sampleTrend.map((point) => {
            const heightPercent = Math.round((point.value / max) * 100)
            return (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-md bg-primary/85"
                    style={{ height: `${heightPercent}%`, minHeight: "0.5rem" }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{point.label}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          "briefs ai" — 7-month interest curve, +86% trend
        </p>
      </div>
    </div>
  )
}

function SampleExecution() {
  const phases = [
    { name: "Discovery", timeframe: "Week 1-2", detail: "Validate problem with 8 agencies" },
    { name: "MVP", timeframe: "Week 3-6", detail: "Brief generator + Slack reply" },
    { name: "Pricing", timeframe: "Week 7-8", detail: "Two-tier, $29 starter, $99 studio" },
    { name: "Launch", timeframe: "Week 9-12", detail: "Public beta + 50 agency waitlist" },
  ]
  return (
    <div className="space-y-5">
      <SectionEyebrow icon={Workflow}>Execution plan</SectionEyebrow>
      <ol className="space-y-3">
        {phases.map((phase, index) => (
          <li
            key={phase.name}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/85 p-4"
          >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-medium">{phase.name}</p>
                <p className="text-[12px] text-muted-foreground">{phase.timeframe}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{phase.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function SampleShare() {
  return (
    <div className="space-y-5">
      <SectionEyebrow icon={Globe}>Shareable report</SectionEyebrow>
      <div className="rounded-2xl border border-border/60 bg-background/85 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              ketch.krtclcdy.workers.dev
            </p>
            <p className="mt-1 font-medium">/share/mosaic-health-healthcare-a1b2</p>
          </div>
          <Button size="sm" className="rounded-full" type="button">
            <Bot className="size-3.5" />
            Copy link
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Public, no account, no tracking. Anyone with the link sees the full
          memo, the score, and the analysis dashboard.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-2xl border border-border/60 bg-background/85 p-3">
          <Bot className="mx-auto size-4 text-primary" />
          <p className="mt-1.5 font-medium">AI prompt</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/85 p-3">
          <Sparkles className="mx-auto size-4 text-primary" />
          <p className="mt-1.5 font-medium">Markdown</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/85 p-3">
          <Wallet className="mx-auto size-4 text-primary" />
          <p className="mt-1.5 font-medium">Plain text</p>
        </div>
      </div>
    </div>
  )
}

function HeroMockup() {
  return (
    <div className="relative">
      <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-card/90 py-0 shadow-xs">
        <CardContent className="space-y-5 p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              <Sparkles className="size-3.5 text-primary" />
              AI Tool · Agent workflow
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">live</span>
          </div>
          <div>
            <h3 className="font-display text-3xl leading-tight">
              Mosaic Health
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Brief-on-call AI co-pilot for independent specialty clinics. One
              intake, one structured memo, every visit.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sampleRow.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-border/60 bg-background/85 p-3 text-center"
              >
                <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {row.label}
                </p>
                <p className="mt-1 font-display text-xl leading-none tabular-nums">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/85 p-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Why now
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              Specialty clinics are short on intake staff, long on forms. The
              ambient-AI wave is opening a window for tooling that doesn't
              require a year-long integration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["Agent workflow", "Fast MVP", "B2B"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border/60 bg-background/85 px-3 py-1 text-[12px] font-medium text-foreground/80"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <CalendarDays className="size-3.5" />
              8 days ago
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
