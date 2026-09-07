import type { Metadata } from "next";

import { LearnLecturePage } from "@/components/learn-lecture-page";
import { getLectureBySlug } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";

const lecture = getLectureBySlug("lecture-2-governance-ui")!;

export const metadata: Metadata = buildRouteMetadata({
  title: lecture.title,
  description: lecture.summary,
  path: `/learn/${lecture.slug}`,
  keywords: ["learn", "governance ui", "commit reveal", "voice governance"],
});

export default function LearnLectureTwoPage() {
  return <LearnLecturePage lecture={lecture} />;
}
