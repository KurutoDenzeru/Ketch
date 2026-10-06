import type { StartupIdea } from "@/types/idea"
import { ExecutionTimeline } from "@/components/analysis/execution-timeline"
import { FitAndLadder } from "@/components/analysis/fit-and-ladder"
import { KeywordTable } from "@/components/analysis/keyword-table"
import { ProofSignals } from "@/components/analysis/proof-signals"
import { ScoreRow } from "@/components/analysis/score-row"
import { TagsRow } from "@/components/analysis/tags-row"
import { TrendChart } from "@/components/analysis/trend-chart"
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger"

type AnalysisDashboardProps = {
  idea: StartupIdea
}

/** One column below md, two from md up, with dense flow so no cell is stranded. */
export function AnalysisDashboard({ idea }: AnalysisDashboardProps) {
  return (
    <StaggerGroup className="grid grid-cols-1 gap-4 md:grid-flow-dense md:grid-cols-2">
      <StaggerItem>
        <TagsRow tags={idea.analysis.tags} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <ScoreRow metrics={idea.analysis.scoreMetrics} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <TrendChart idea={idea} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <ProofSignals analysis={idea.analysis} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <FitAndLadder idea={idea} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <KeywordTable signals={idea.analysis.keywordSignals} />
      </StaggerItem>
      <StaggerItem className="md:col-span-2">
        <ExecutionTimeline steps={idea.analysis.detailedPlan} />
      </StaggerItem>
    </StaggerGroup>
  )
}