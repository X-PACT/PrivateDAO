import type { Metadata } from "next";

import { CompetitionReadinessSurface } from "@/components/competition-readiness-surface";
import { FrontierSignalBoard } from "@/components/frontier-signal-board";
import { OperationsShell } from "@/components/operations-shell";
import { SolutionCorridors } from "@/components/solution-corridors";
import { VideoCenter } from "@/components/video-center";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Competition Readiness",
  description:
    "Track-by-track readiness surface for Frontier and Superteam competitions across privacy, RPC, consumer, infrastructure, and live dApp categories.",
  path: "/tracks",
  keywords: ["competition readiness", "frontier tracks", "superteam", "privacy track", "rpc", "consumer apps"],
});

export default function TracksPage() {
  return (
    <OperationsShell
      eyebrow="Competition Readiness"
      title="A track-by-track readiness surface for Frontier, Superteam, and side-track submissions"
      description="This page keeps the competition strategy disciplined while still aiming high. It shows where PrivateDAO is strongest already, which routes now serve as first-place submission corridors, and how the live product, proof, and services surfaces reinforce each track."
      badges={[
        { label: "Competition Readiness", variant: "cyan" },
        { label: "Truth-aligned", variant: "success" },
        { label: "Track-by-track", variant: "violet" },
      ]}
    >
      <div>
        <CompetitionReadinessSurface />
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
