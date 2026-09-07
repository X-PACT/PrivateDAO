import type { Metadata } from "next";

import { ArchivedRouteRedirect } from "@/components/archived-route-redirect";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Archived Product Route",
  description: "This historical product route has moved to the current PrivateDAO product catalog.",
  path: "/txline-settlement",
});

export default function ArchivedTxlineRoute() {
  return <ArchivedRouteRedirect target="/products/" label="View the current product catalog" />;
}
