import type { Metadata } from "next";

import SecurityPage from "@/app/security/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Trust",
  description:
    "Security, proof, hardening, and operating-readiness surfaces for reviewers, operators, buyers, and ecosystem supporters.",
  path: "/trust",
  keywords: ["trust", "security", "proof", "hardening", "operating boundary"],
});

export default SecurityPage;
