import type { Metadata } from "next";

import { InfrastructureStartupProofStrip } from "@/components/infrastructure-startup-proof-strip";
import { OperationsShell } from "@/components/operations-shell";
import { SectionHeader } from "@/components/section-header";
import { VideoCenter } from "@/components/video-center";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Story Video",
  description:
    "Comprehensive PrivateDAO story video covering private governance, confidential treasury operations, proof surfaces, commercial corridors, and why the project is positioned to win across current competitions.",
  path: "/story",
  keywords: ["story video", "product video", "competition reel", "demo video"],
});

export default function StoryPage() {
  return (
    <OperationsShell
      eyebrow="Story Video"
      title="One upload-ready video for everything PrivateDAO offers and why it wins"
      description="This route hosts the comprehensive product story for judges, buyers, operators, and YouTube uploads. It explains the full stack without splitting the message across unrelated demo clips."
      badges={[
        { label: "Story surface", variant: "cyan" },
        { label: "Upload-ready", variant: "success" },
        { label: "Competition aligned", variant: "violet" },
      ]}
    >
      <InfrastructureStartupProofStrip route="story" />
      <div>
        <VideoCenter />
      </div>
      <div>
        <SectionHeader
          eyebrow="Why this matters"
          title="The reel is now a product asset, not a sidecar file"
          description="It is hosted on the live site, available as a direct MP4, and aligned with the core competition, proof, and services surfaces."
        />
      </div>
    </OperationsShell>
  );
}
