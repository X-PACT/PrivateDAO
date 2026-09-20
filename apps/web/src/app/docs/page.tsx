import type { Metadata } from "next";

import DevelopersPage from "@/app/developers/page";
import { BreadcrumbJsonLd } from "@/components/seo-structured-data";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Developer Documentation",
  description: "PrivateDAO developer documentation for workflow integrations, verification, Agents, APIs, and evidence-bound network capabilities.",
  path: "/docs",
  image: "/assets/social/whitepaper.png",
  keywords: ["PrivateDAO developer documentation", "workflow API", "verification API", "agent integrations"],
});

export default function DocsPage() {
  return <><BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name: "Developer Documentation", path: "/docs" }]} /><DevelopersPage /></>;
}
