import type { Metadata } from "next";

import { LearnLecturePage } from "@/components/learn-lecture-page";
import { getLectureBySlug } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";

const lecture = getLectureBySlug("lecture-1-web2-to-solana-ui")!;

export const metadata: Metadata = buildRouteMetadata({
  title: lecture.title,
  description: lecture.summary,
  path: `/learn/${lecture.slug}`,
  keywords: ["learn", "solana frontend", "wallet-first", "testnet onboarding"],
});

export default function LearnLectureOnePage() {
  return <LearnLecturePage lecture={lecture} />;
}
