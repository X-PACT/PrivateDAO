import type { Metadata } from "next";

import { CompetitionReadinessSurface } from "@/components/competition-readiness-surface";
import { OperationsShell } from "@/components/operations-shell";
import { SolutionCorridors } from "@/components/solution-corridors";
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
      description="This page keeps the competition strategy honest. It shows where PrivateDAO is already strongest, where the frontend and product shell now help, and what still needs a sharper corridor before a first-place push."
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
        <SolutionCorridors />
      </div>
    </OperationsShell>
  );
}
