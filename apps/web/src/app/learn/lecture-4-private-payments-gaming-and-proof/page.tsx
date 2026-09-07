import type { Metadata } from "next";

import { LearnLecturePage } from "@/components/learn-lecture-page";
import { getLectureBySlug } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";

const lecture = getLectureBySlug("lecture-4-private-payments-gaming-and-proof")!;

export const metadata: Metadata = buildRouteMetadata({
  title: lecture.title,
  description: lecture.summary,
  path: `/learn/${lecture.slug}`,
  keywords: ["learn", "private payments", "gaming dao", "zk", "magicblock", "refhe"],
});

export default function LearnLectureFourPage() {
  return <LearnLecturePage lecture={lecture} />;
}
