import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCompetitionLaneLabel, getCompetitionLaneSummary } from "@/lib/competition-lane-labels";
import {
  competitionTrackWorkspaces,
  getCompetitionTrackWorkspace,
} from "@/lib/site-data";
import { buildRouteMetadata } from "@/lib/route-metadata";

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
    keywords: [workspace.sponsor, "product route", workspace.slug],
    index: false,
  });
}

export default async function TrackWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) notFound();
  redirect(workspace.liveRoute);
}
