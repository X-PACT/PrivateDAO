import { NextResponse } from "next/server";

import {
  buildProofWorkflowVerification,
  createProofWorkflowEvent,
  redactProofWorkflowEvent,
  type ProofWorkflowEventInput,
} from "@/lib/proof-workflows";

export const dynamic = "force-static";

type EventBody = ProofWorkflowEventInput & {
  previousEvents?: Array<ReturnType<typeof redactProofWorkflowEvent>>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EventBody;
    const event = createProofWorkflowEvent(body);
    const publicEvent = redactProofWorkflowEvent(event);
    const events = [...(body.previousEvents ?? []), publicEvent];
    const verification = buildProofWorkflowVerification({
      templateId: body.templateId,
      workflowId: body.workflowId,
      events,
    });

    return NextResponse.json(
      {
        ok: true,
        internalEvent: event,
        publicEvent,
        proofPacket: {
          workflowId: body.workflowId,
          templateId: body.templateId,
          eventId: event.eventId,
          proofHash: event.proofHash,
          timestamp: event.timestamp,
          actorCommitment: event.actorCommitment,
          privateDataExcluded: verification.privateDataExcluded,
        },
        verification,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create proof event.",
      },
      { status: 400 },
    );
  }
}
