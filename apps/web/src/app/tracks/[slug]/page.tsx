import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CompetitionWorkspace } from "@/components/competition-workspace";
import { GrantExecutionReadinessPanel } from "@/components/grant-execution-readiness-panel";
import { OperationsShell } from "@/components/operations-shell";
import { TrackJudgeFirstTopStrip } from "@/components/track-judge-first-top-strip";
import { TrackOperationalEdgePanel } from "@/components/track-operational-edge-panel";
import { TrackExecutionUnlockPanel } from "@/components/track-execution-unlock-panel";
import { TrackProofClosurePanel } from "@/components/track-proof-closure-panel";
import { TrackSubmissionCapsule } from "@/components/track-submission-capsule";
import { VideoCenter } from "@/components/video-center";
import { getCompetitionLaneLabel, getCompetitionLaneSummary } from "@/lib/competition-lane-labels";
import {
  competitionTrackWorkspaces,
  getCompetitionTrackWorkspace,
} from "@/lib/site-data";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { TRACK_PROOF_PRIORITY_SLUGS } from "@/lib/track-proof-closure";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
    title: getCompetitionLaneLabel(workspace.slug),
    description: getCompetitionLaneSummary(workspace.slug),
    path: `/tracks/${workspace.slug}`,
    keywords: [workspace.sponsor, "competition workspace", workspace.slug],
    index: false,
  });
}

export default async function TrackWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) notFound();
  const showJudgeFirstTopStrip = TRACK_PROOF_PRIORITY_SLUGS.has(workspace.slug);

  return (
    <OperationsShell
      eyebrow="Submission Workspace"
      title={getCompetitionLaneLabel(workspace.slug)}
      description={getCompetitionLaneSummary(workspace.slug)}
      badges={[
        { label: "Reviewer corridor", variant: "cyan" },
        { label: "Submission route", variant: "success" },
        { label: "Truth-aligned", variant: "violet" },
      ]}
    >
      <div>
        <Suspense fallback={<div className="h-px" aria-hidden="true" />}>
          {showJudgeFirstTopStrip ? (
            <TrackJudgeFirstTopStrip workspace={workspace} />
          ) : (
            <TrackSubmissionCapsule workspace={workspace} />
          )}
        </Suspense>
      </div>
      <div>
        <TrackOperationalEdgePanel workspace={workspace} />
      </div>
      <div>
        <TrackExecutionUnlockPanel workspace={workspace} />
      </div>
      <div>
        <GrantExecutionReadinessPanel workspace={workspace} />
      </div>
      {!showJudgeFirstTopStrip ? (
        <div>
          <TrackProofClosurePanel workspace={workspace} />
        </div>
      ) : null}
      <div>
        <CompetitionWorkspace workspace={workspace} />
      </div>
      <div>
        <VideoCenter compact />
      </div>
    </OperationsShell>
  );
}
