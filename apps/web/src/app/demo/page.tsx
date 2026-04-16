import type { Metadata } from "next";

import StoryPage from "@/app/story/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Product Story",
  description:
    "Legacy alias for the live PrivateDAO product story covering user flow, Devnet actions, trust surfaces, and rollout narrative.",
  path: "/demo",
  keywords: ["product story", "product video", "private dao story", "devnet product"],
  index: false,
});

export default StoryPage;
