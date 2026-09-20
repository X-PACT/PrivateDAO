import type { Metadata } from "next";

import ApiStatusPage from "@/app/api-status/page";
import { BreadcrumbJsonLd } from "@/components/seo-structured-data";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Status",
  description: "Public status and evidence boundaries for PrivateDAO products, APIs, verification surfaces, and supported execution paths.",
  path: "/status",
  image: "/assets/social/whitepaper.png",
  keywords: ["PrivateDAO status", "product status", "API status", "verification status"],
});

export default function StatusPage() {
  return <><BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Status", path: "/status" }]} /><ApiStatusPage /></>;
}
