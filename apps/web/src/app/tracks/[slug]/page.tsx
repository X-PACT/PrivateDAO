import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CompetitionWorkspace } from "@/components/competition-workspace";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { OperationsShell } from "@/components/operations-shell";
import { TrackProofClosurePanel } from "@/components/track-proof-closure-panel";
import { TrackSubmissionCapsule } from "@/components/track-submission-capsule";
import { VideoCenter } from "@/components/video-center";
import {
  competitionTrackWorkspaces,
  getCompetitionTrackWorkspace,
} from "@/lib/site-data";
import { buildRouteMetadata } from "@/lib/route-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const CUSTODY_TRUTH_PRIORITY_TRACKS = new Set([
  "colosseum-frontier",
  "privacy-track",
  "rpc-infrastructure",
]);

export async function generateStaticParams() {
  return competitionTrackWorkspaces.map((workspace) => ({ slug: workspace.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) {
    return buildRouteMetadata({
      title: "Track Workspace Not Found",
      description: "Requested competition workspace was not found.",
      path: `/tracks/${slug}`,
    });
  }

  return buildRouteMetadata({
    title: workspace.title,
    description: workspace.objective,
    path: `/tracks/${workspace.slug}`,
    keywords: [workspace.sponsor, "competition workspace", workspace.slug],
  });
}

export default async function TrackWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) notFound();
  const showCustodyTruthQuickActions = CUSTODY_TRUTH_PRIORITY_TRACKS.has(workspace.slug);

  return (
    <OperationsShell
      eyebrow="Competition Workspace"
      title={workspace.title}
      description={workspace.objective}
      badges={[
        { label: workspace.sponsor, variant: "cyan" },
        { label: "Submission route", variant: "success" },
        { label: "Truth-aligned", variant: "violet" },
      ]}
    >
      <div>
        <Suspense fallback={<div className="h-px" aria-hidden="true" />}>
          <TrackSubmissionCapsule workspace={workspace} />
        </Suspense>
      </div>
      {showCustodyTruthQuickActions ? (
        <div>
          <CustodyTruthQuickActions
            title="Custody truth surfaces for judges"
            description={`Open the exact custody proof, reviewer packet, intake schema, and apply route for ${workspace.title} without leaving the top submission layer.`}
          />
        </div>
      ) : null}
      <div>
        <TrackProofClosurePanel workspace={workspace} />
      </div>
      <div>
        <CompetitionWorkspace workspace={workspace} />
      </div>
      <div>
        <VideoCenter compact />
      </div>
    </OperationsShell>
  );
}
