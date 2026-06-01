import { NextResponse } from "next/server";

import type { PrivatePayoutIntent } from "@/lib/providers/private-payout-provider";
import { getPrivatePayoutProvider } from "@/lib/providers/private-payout-registry";

export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { provider?: PrivatePayoutIntent["provider"] | "default"; intent?: PrivatePayoutIntent };
    if (!body.intent) {
      throw new Error("intent is required.");
    }

    const provider = await getPrivatePayoutProvider(body.provider ?? body.intent.provider);
    const validation = await provider.validateIntent(body.intent);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const executionResult = await provider.executeTestnet(body.intent);
    const receipt = await provider.buildReceipt(body.intent, executionResult);

    return NextResponse.json({
      ok: true,
      provider: provider.id,
      executionResult,
      receipt,
      leakCheck: "Receipt excludes raw recipient address, raw recipient metadata, and private notes.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Private payout execution failed." },
      { status: 400 },
    );
  }
}
