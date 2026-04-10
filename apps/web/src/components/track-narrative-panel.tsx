import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getTrackNarrativePlan } from "@/lib/track-narratives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TrackNarrativePanelProps = {
  workspace: CompetitionTrackWorkspace;
};

export function TrackNarrativePanel({ workspace }: TrackNarrativePanelProps) {
  const narrative = getTrackNarrativePlan(workspace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategic narrative</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">
            Why us
          </div>
          <div className="mt-3 text-sm leading-7 text-white/74">{narrative.whyUs}</div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">
            The future: problem and solution
          </div>
          <div className="mt-3 text-sm leading-7 text-white/72">
            {narrative.futureProblemSolution}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-300/18 bg-emerald-300/8 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/76">
            Why this sponsor should care now
          </div>
          <div className="mt-3 text-sm leading-7 text-white/74">
            {narrative.whySponsorShouldCareNow}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
