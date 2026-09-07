import { NextResponse } from "next/server";

import { getIntelligenceProvider } from "@/lib/intelligence/provider-registry";
import type { IntelligenceProviderId, IntelligenceRequest } from "@/lib/intelligence/providers/types";
import { sanitizeIntelligenceRequest } from "@/lib/intelligence/providers/types";

export const dynamic = "force-static";

export async function POST(request: Request) {
  const body = (await request.json()) as IntelligenceRequest & { providerId?: IntelligenceProviderId };
  const provider = getIntelligenceProvider(body.providerId);
  const result = await provider.counterpartyRisk(sanitizeIntelligenceRequest({ ...body, includeCounterpartyContext: true }));
  return NextResponse.json({ ok: true, result, dataSentToProviders: body.counterpartyAddress ? ["counterparty address"] : [] });
}
