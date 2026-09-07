import type { Metadata } from "next";

import { ArchivedRouteRedirect } from "@/components/archived-route-redirect";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Archived Developer Route",
  description: "This historical developer route has moved to the current PrivateDAO developer surface.",
  path: "/developers/txline-settlement-api",
});

export default function ArchivedTxlineDeveloperRoute() {
  return <ArchivedRouteRedirect target="/developers/" label="Open the current developer surface" />;
}
