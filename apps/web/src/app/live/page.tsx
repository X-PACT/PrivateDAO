import type { Metadata } from "next";

import DashboardPage from "@/app/dashboard/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Live State",
  description:
    "Live proposals, treasury state, execution history, and governance logs for the current Testnet product surface.",
  path: "/live",
  keywords: ["live state", "treasury", "governance logs", "proposal state"],
  index: false,
});

export default DashboardPage;
