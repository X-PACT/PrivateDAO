import type { Metadata } from "next";

import { InfrastructureStartupProofStrip } from "@/components/infrastructure-startup-proof-strip";
import { OperationsShell } from "@/components/operations-shell";
import { SectionHeader } from "@/components/section-header";
import { VideoCenter } from "@/components/video-center";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Story Video",
  description:
    "Comprehensive PrivateDAO story video covering private governance, confidential treasury operations, payments, gaming, API and RPC visibility, proof surfaces, and the public-good product strategy behind the platform.",
  path: "/story",
  keywords: ["story video", "product video", "governance guide", "product walkthrough"],
});

export default function StoryPage() {
  return (
    <OperationsShell
      eyebrow="Story Video"
      title="One product story for governance, payments, gaming, infrastructure, and privacy in the same system"
      description="This route hosts the complete product story for buyers, operators, community supporters, and anyone evaluating the system. It explains how PrivateDAO turns advanced governance, treasury rails, cryptography, and runtime clarity into a usable product."
      badges={[
        { label: "Story surface", variant: "cyan" },
        { label: "Watch-ready", variant: "success" },
        { label: "Public-good product story", variant: "violet" },
      ]}
    >
      <InfrastructureStartupProofStrip route="story" />
      <div>
        <VideoCenter />
      </div>
      <div>
        <SectionHeader
          eyebrow="Why this matters"
          title="The reel is an integrated product asset, not a stand-alone media surface"
          description="It is hosted on the live site, available as a direct MP4, and aligned with the learn, start, trust, proof, and services routes so a visitor can go from explanation to live Devnet use without losing context."
        />
      </div>
    </OperationsShell>
  );
}
