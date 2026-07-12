import type { Metadata } from "next";

import { CreditDecisionVerificationPilot } from "@/components/credit-decision-verification-pilot";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Credit Decision Verification Pilot",
  description:
    "A focused proof-backed underwriting workflow: import earnings, apply a private credit policy, issue a limit, and verify proof without exposing private data.",
  path: "/pilots/yumi-cash-verification",
  keywords: ["credit decision verification", "proof-backed underwriting", "credit limit proof", "private earnings verification"],
});

export default function CreditDecisionVerificationPilotPage() {
  return <CreditDecisionVerificationPilot />;
}
