import { NextResponse } from "next/server";

import { getPrivatePayoutProviderStatuses } from "@/lib/providers/private-payout-registry";

export const dynamic = "force-static";

export async function GET() {
  const providers = await getPrivatePayoutProviderStatuses();
  const active = providers.find((provider) => provider.provider === "umbra" && provider.configured);
  return NextResponse.json({
    ok: true,
    activeProvider: active?.provider ?? null,
    activeStatus: active ? "configured" : "unavailable",
    productBoundary: "Private payout providers support payroll, vendor, reward, and treasury payout rehearsals. They are not the governance privacy primitive.",
    providers,
  });
}
