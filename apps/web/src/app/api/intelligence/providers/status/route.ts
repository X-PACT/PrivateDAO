import { NextResponse } from "next/server";

import { getIntelligenceProviderStatuses } from "@/lib/intelligence/provider-registry";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    ok: true,
    principle: "PrivateDAO owns the workflow. Data vendors are optional provider inputs.",
    privacyBoundary: "Hidden vote intent, live vote counts, voter identities, momentum, and private room notes are never sent to providers by default.",
    providers: await getIntelligenceProviderStatuses(),
  });
}
