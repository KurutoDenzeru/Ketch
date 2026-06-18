import {
  Activity,
  BrainCircuit,
  BriefcaseBusiness,
  BriefcaseConveyorBelt,
  Building2,
  Cable,
  ChartColumn,
  ClipboardCheck,
  Coins,
  Compass,
  DollarSign,
  FileText,
  FlaskConical,
  Gauge,
  GraduationCap,
  HeartPulse,
  KeyRound,
  Layers3,
  MapPinned,
  MessageSquareMore,
  NotebookPen,
  Orbit,
  Radar,
  Receipt,
  Route,
  ScanSearch,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkle,
  Sparkles,
  Sprout,
  Store,
  TestTube2,
  Trophy,
  UserRoundCheck,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { IdeaCategory } from "@/types/idea"
import { categoryFocusOptions, ideaCategories } from "@/types/idea"

const focusIconMap: Record<string, LucideIcon> = {
  agent: BrainCircuit,
  "content generation": Sparkle,
  research: Search,
  copilot: Orbit,
  internal: Building2,
  "team productivity": BriefcaseBusiness,
  vertical: Layers3,
  analytics: ChartColumn,
  "ci/cd": Route,
  observability: Gauge,
  testing: TestTube2,
  "developer productivity": Wrench,
  habit: Activity,
  "consumer utility": Smartphone,
  wellness: HeartPulse,
  "local discovery": MapPinned,
  matching: Cable,
  "services marketplace": Store,
  "niche communities": UserRoundCheck,
  "local supply": Compass,
  expense: Receipt,
  "embedded finance": Coins,
  "smb finance": DollarSign,
  "personal wealth": Trophy,
  "practice operations": ClipboardCheck,
  "patient engagement": HeartPulse,
  "mental health": Activity,
  compliance: ClipboardCheck,
  "audience growth": ChartColumn,
  monetization: DollarSign,
  "editing workflow": NotebookPen,
  "content planning": FileText,
  upskilling: GraduationCap,
  "test prep": School,
  "micro-learning": BrainCircuit,
  "school workflow": School,
  "store optimization": ShoppingBag,
  "post-purchase": Receipt,
  "creator commerce": Store,
  inventory: BriefcaseConveyorBelt,
  "security training": ShieldCheck,
  appsec: ShieldAlert,
  identity: KeyRound,
  "threat detection": Radar,
  "energy efficiency": Sprout,
  "carbon tracking": ScanSearch,
  "climate adaptation": Compass,
  "circular economy": Route,
  "interest graph": Orbit,
  messaging: MessageSquareMore,
  "status sharing": Sparkles,
  "creator community": UserRoundCheck,
  "back-office automation": BriefcaseConveyorBelt,
  scheduling: Route,
  "field operations": Compass,
  documentation: FileText,
}

export function getFocusIcon(focus: string): LucideIcon {
  const normalized = focus.toLowerCase()
  for (const key of Object.keys(focusIconMap)) {
    if (normalized.includes(key)) {
      return focusIconMap[key] ?? FlaskConical
    }
  }
  return FlaskConical
}

const categoryIconMap: Record<IdeaCategory, LucideIcon> = {
  SaaS: BriefcaseBusiness,
  "AI Tool": BrainCircuit,
  "Dev Tool": Wrench,
  "Mobile App": Smartphone,
  Marketplace: Store,
  Fintech: Coins,
  Healthcare: HeartPulse,
  "Creator Tool": Sparkles,
  Education: GraduationCap,
  "E-commerce": ShoppingBag,
  Cybersecurity: ShieldCheck,
  Climate: Sprout,
  "Consumer Social": MessageSquareMore,
  Operations: BriefcaseConveyorBelt,
}

export function getCategoryIcon(category: IdeaCategory): LucideIcon {
  return categoryIconMap[category]
}

export const allFocusOptions = Object.values(categoryFocusOptions).flat()

export { ideaCategories }
