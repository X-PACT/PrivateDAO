import type { Metadata } from "next";

import StoryPage from "@/app/story/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Demo",
  description:
    "Hosted product demo for PrivateDAO covering the user flow, Devnet actions, trust surfaces, and rollout story.",
  path: "/demo",
  keywords: ["demo", "product video", "private dao demo", "devnet demo"],
});

export default StoryPage;
