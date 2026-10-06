import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { SectionHeader } from "@/components/section-header"

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: "Do I need an account to use Ketch?",
    a: "No. Ketch is local-first. Your saved ideas, brief drafts, and shared link history live in this browser. Nothing leaves the device unless you explicitly share a link or export JSON.",
  },
  {
    q: "What model powers the generation?",
    a: "Ketch uses Google Gemini for the heavy lifting: idea framing, scoring, market validation, and pitch drafting. The brief stays small and structured to keep responses grounded.",
  },
  {
    q: "How is the validation score calculated?",
    a: "It is a blend of four signals: timing (trend curve), defensibility (competition framing), opportunity (audience-product fit), and execution (realism of the phased plan). Scores are tempered to stay inside a 1-10 band.",
  },
  {
    q: "Can I share an idea without saving it?",
    a: "Yes. The Share button on any idea creates a public link immediately. Saved ideas add the same snapshot to your Library, and a recently-viewed entry to anyone who opens the link.",
  },
  {
    q: "Is there a rate limit?",
    a: "To keep generation fair across users, Ketch applies a weekly cap shown in the Idea Lab. The cap is generous; you will see remaining credits next to the Generate button.",
  },
  {
    q: "What happens to my data if I clear my browser?",
    a: "Saved ideas, the brief draft, and recent shared links all live in localStorage and will be cleared. To move data between browsers, use the Export / Import buttons in Settings.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-t border-border/60 pt-16 md:pt-20">
      <div className="grid gap-12 md:gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <SectionHeader
          eyebrow="FAQ"
          title="Honest answers, no marketing."
          description="If something here is still unclear, open the lab and try it. Everything runs in your browser."
          className="lg:sticky lg:top-32 lg:self-start"
        />
        <ScrollReveal delay={80}>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.q}
                value={item.q}
                className="border-border/60 px-5 last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-start text-sm font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-pretty text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  )
}
