import type { Metadata } from "next";

import { HomeShell } from "@/components/home-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Overview",
  description:
    "PrivateDAO overview surface for buyers, judges, and operators: product narrative, command center, proof, security, services, and diagnostics in one Next.js interface.",
  path: "/",
  keywords: ["overview", "buyer journey", "command center"],
});

export default function HomePage() {
  return <HomeShell />;
}
