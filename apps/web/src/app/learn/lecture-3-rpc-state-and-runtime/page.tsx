import type { Metadata } from "next";

import { LearnLecturePage } from "@/components/learn-lecture-page";
import { getLectureBySlug } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";

const lecture = getLectureBySlug("lecture-3-rpc-state-and-runtime")!;

export const metadata: Metadata = buildRouteMetadata({
  title: lecture.title,
  description: lecture.summary,
  path: `/learn/${lecture.slug}`,
  keywords: ["learn", "fast rpc", "diagnostics", "runtime visibility", "analytics"],
});

export default function LearnLectureThreePage() {
  return <LearnLecturePage lecture={lecture} />;
}
