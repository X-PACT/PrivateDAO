import { NextResponse } from "next/server";

import {
  buildProofWorkflowVerification,
  type ProofWorkflowTemplateId,
  type PublicProofWorkflowEvent,
} from "@/lib/proof-workflows";
import { verifyCreditLimitProofPackage } from "@/lib/proof-workflow-verifier";

export const dynamic = "force-static";

type VerifyBody = {
  workflowId?: string;
  templateId?: ProofWorkflowTemplateId;
  events?: PublicProofWorkflowEvent[];
  proofPackage?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    if (body.proofPackage) {
      const verification = verifyCreditLimitProofPackage(body.proofPackage);
      return NextResponse.json(
        {
          ok: verification.ok,
          verification,
          explanation:
            "We recompute the proof from the public proof package and compare it with the original hash. If anything changes, verification fails.",
        },
        { status: verification.ok ? 200 : 422 },
      );
    }

    if (!body.workflowId?.trim()) throw new Error("workflowId is required.");
    const templateId = body.templateId ?? "grant-review";
    const events = body.events ?? [];

    return NextResponse.json(
      {
        ok: true,
        verification: buildProofWorkflowVerification({
          templateId,
          workflowId: body.workflowId.trim(),
          events,
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to verify proof workflow.",
      },
      { status: 400 },
    );
  }
}
