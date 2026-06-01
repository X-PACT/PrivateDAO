import { NextResponse } from "next/server";

import type { PrivatePayoutIntentInput } from "@/lib/providers/private-payout-provider";
import { getPrivatePayoutProvider } from "@/lib/providers/private-payout-registry";

export const dynamic = "force-static";

function normalizeInput(body: Partial<PrivatePayoutIntentInput>): PrivatePayoutIntentInput {
  if (!body.daoId || !body.proposalId || !body.recipientAddress) {
    throw new Error("daoId, proposalId, and recipientAddress are required.");
  }
  return {
    provider: body.provider ?? "default",
    daoId: String(body.daoId),
    proposalId: String(body.proposalId),
    operationType: body.operationType ?? "vendor",
    asset: body.asset ?? "USDC",
    amount: body.amount ?? "0",
    recipientAddress: String(body.recipientAddress),
    recipientMetadata: body.recipientMetadata,
    privacyMode: body.privacyMode ?? "proof-only",
    publicOutcome: body.publicOutcome ?? "private payout prepared",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PrivatePayoutIntentInput>;
    const input = normalizeInput(body);
    const provider = await getPrivatePayoutProvider(input.provider);
    const intent = await provider.prepareIntent(input);
    return NextResponse.json({
      ok: true,
      provider: provider.id,
      intent,
      boundary: "Recipient address and metadata are represented as hashes in the intent surface.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Private payout prepare failed." },
      { status: 400 },
    );
  }
}
