import type { Metadata } from "next";

import { CompetitionReadinessSurface } from "@/components/competition-readiness-surface";
import { FrontierSignalBoard } from "@/components/frontier-signal-board";
import { FundingCorridorIndexPanel } from "@/components/funding-corridor-index-panel";
import { OperationsShell } from "@/components/operations-shell";
import { StrategicOpportunitySurface } from "@/components/strategic-opportunity-surface";
import { CapitalReadinessPacketStrip } from "@/components/capital-readiness-packet-strip";
import { SolutionCorridors } from "@/components/solution-corridors";
import { VideoCenter } from "@/components/video-center";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Submission Corridors",
  description:
    "Professional submission corridors for Frontier, grants, infrastructure, and adjacent reviewer opportunities without bounty-stacking optics.",
  path: "/tracks",
  keywords: ["submission corridors", "frontier readiness", "runtime infrastructure", "confidential governance", "startup grant"],
});

export default function TracksPage() {
  return (
    <OperationsShell
      eyebrow="Submission Corridors"
      title="A disciplined readiness surface for Frontier, grants, and adjacent reviewer opportunities"
      description="This page keeps PrivateDAO aligned around one product thesis while still exposing the strongest reviewer corridors, infrastructure lanes, and capital-readiness opportunities."
      badges={[
        { label: "Submission Corridors", variant: "cyan" },
        { label: "Truth-aligned", variant: "success" },
        { label: "Reviewer-first", variant: "violet" },
      ]}
    >
      <div>
        <CompetitionReadinessSurface />
      </div>
      <div>
        <StrategicOpportunitySurface />
      </div>
      <div>
        <CapitalReadinessPacketStrip />
      </div>
      <div>
        <FundingCorridorIndexPanel />
      </div>
      <div>
        <FrontierSignalBoard />
      </div>
      <div>
        <VideoCenter compact />
      </div>
      <div>
        <SolutionCorridors />
      </div>
    </OperationsShell>
  );
}
