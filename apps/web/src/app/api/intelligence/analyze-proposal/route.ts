import { NextResponse } from "next/server";

import { getIntelligenceProvider } from "@/lib/intelligence/provider-registry";
import type { IntelligenceProviderId, IntelligenceRequest } from "@/lib/intelligence/providers/types";
import { sanitizeIntelligenceRequest } from "@/lib/intelligence/providers/types";

export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IntelligenceRequest & { providerId?: IntelligenceProviderId };
    const provider = getIntelligenceProvider(body.providerId);
    const result = await provider.analyzeProposal(sanitizeIntelligenceRequest(body));
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Proposal analysis failed." },
      { status: 400 },
    );
  }
}
