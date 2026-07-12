import { NextResponse } from "next/server";

import {
  createWorkflowId,
  getProofWorkflowTemplate,
  type ProofWorkflowTemplateId,
} from "@/lib/proof-workflows";

export const dynamic = "force-static";

type PrepareBody = {
  templateId?: ProofWorkflowTemplateId;
  organizationLabel?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PrepareBody;
    const templateId = body.templateId ?? "grant-review";
    const organizationLabel = body.organizationLabel?.trim() || "PrivateDAO customer organization";
    const createdAt = new Date().toISOString();
    const template = getProofWorkflowTemplate(templateId);
    const workflowId = createWorkflowId({ templateId, organizationLabel, createdAt });

    return NextResponse.json(
      {
        ok: true,
        workflow: {
          workflowId,
          templateId,
          organizationLabel,
          createdAt,
          status: "prepared",
          verificationUrl: `/proof-workflows/verify?workflowId=${workflowId}&templateId=${templateId}`,
        },
        template,
        timeline: template.stages.map((stage, index) => ({
          ...stage,
          sequence: index + 1,
          status: "pending",
          proofGenerated: false,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to prepare proof workflow.",
      },
      { status: 400 },
    );
  }
}
