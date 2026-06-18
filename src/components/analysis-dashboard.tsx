import type { StartupIdea } from "@/types/idea"
import { ExecutionTimeline } from "@/components/analysis/execution-timeline"
import { FitAndLadder } from "@/components/analysis/fit-and-ladder"
import { KeywordTable } from "@/components/analysis/keyword-table"
import { ProofSignals } from "@/components/analysis/proof-signals"
import { ScoreRow } from "@/components/analysis/score-row"
import { TagsRow } from "@/components/analysis/tags-row"
import { TrendChart } from "@/components/analysis/trend-chart"

type AnalysisDashboardProps = {
  idea: StartupIdea
}

export function AnalysisDashboard({ idea }: AnalysisDashboardProps) {
  return (
    <div className="space-y-8">
      <TagsRow tags={idea.analysis.tags} />
      <ScoreRow metrics={idea.analysis.scoreMetrics} />
      <TrendChart idea={idea} />
      <ProofSignals analysis={idea.analysis} />
      <FitAndLadder idea={idea} />
      <KeywordTable signals={idea.analysis.keywordSignals} />
      <ExecutionTimeline steps={idea.analysis.detailedPlan} />
    </div>
  )
}
