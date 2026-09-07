import type { Metadata } from "next";

import { CreditDecisionVerificationPilot } from "@/components/credit-decision-verification-pilot";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Credit Decision Verification Pilot",
  description:
    "Run a proof-backed credit decision workflow: connect earnings data, apply a private policy, issue a limit, and verify the process publicly without exposing customer data.",
  path: "/pilots/credit-decision-verification",
  keywords: ["credit decision verification", "proof-backed underwriting", "private earnings verification", "proof workflows"],
});

export default function CreditDecisionVerificationPilotPage() {
  return <CreditDecisionVerificationPilot />;
}
