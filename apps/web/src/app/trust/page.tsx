import type { Metadata } from "next";

import SecurityPage from "@/app/security/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Trust",
  description:
    "Security, proof, hardening, and operating-boundary surfaces for reviewers, operators, and buyers.",
  path: "/trust",
  keywords: ["trust", "security", "proof", "hardening", "operating boundary"],
});

export default SecurityPage;
