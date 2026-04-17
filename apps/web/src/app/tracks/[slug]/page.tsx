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
      title: "Product Route Not Found",
      description: "Requested product route was not found.",
      path: "/learn",
    });
  }

  return buildRouteMetadata({
    title: "Redirecting To Product Route",
    description:
      "Legacy route now redirects into the main product flow, proof path, or learning surface.",
    path: workspace.liveRoute,
    keywords: ["PrivateDAO", "product route", "devnet governance", "confidential treasury"],
    index: false,
  });
}

export default async function TrackWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const workspace = getCompetitionTrackWorkspace(slug);
  if (!workspace) notFound();
  redirect(workspace.liveRoute);
}
