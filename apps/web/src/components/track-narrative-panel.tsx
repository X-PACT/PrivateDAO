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
        <CardTitle>Capability narrative</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/52">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Connect</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Review</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Sign</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Verify</span>
        </div>
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
            Why this matters now
          </div>
          <div className="mt-3 text-sm leading-7 text-white/74">
            {narrative.whySponsorShouldCareNow}
          </div>
        </div>
        <div className="rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/66">
          The strongest track narrative is the one a reviewer can follow back into the live wallet-first product path, not a separate hackathon story.
        </div>
      </CardContent>
    </Card>
  );
}
