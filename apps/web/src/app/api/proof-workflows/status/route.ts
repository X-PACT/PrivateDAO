import { NextResponse } from "next/server";

import { blindPolicyVerificationPricing, proofWorkflowPricing, proofWorkflowTemplates } from "@/lib/proof-workflows";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      productLine: "Proof Workflows",
      positioning: "Prove a process happened correctly without exposing how it works.",
      notADaoFeature: true,
      notAVotingFeature: true,
      templates: proofWorkflowTemplates,
      pricing: proofWorkflowPricing,
      blindPolicyVerification: {
        product: "Blind Policy Verification",
        route: "/proof-workflows/blind-policy",
        statusApi: "/api/proof-workflows/blind-policy/status",
        liveReadNodeStatus: "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/status",
        proofSystem: "Groth16",
        packages: blindPolicyVerificationPricing,
      },
      verificationClaims: [
        "process existed",
        "process completed",
        "required approvals happened",
        "required sequence respected",
      ],
      privateDataExcluded: ["documents", "thresholds", "calculations", "reviewer notes", "internal methodology"],
    },
    { status: 200 },
  );
}
