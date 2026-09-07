import { NextResponse } from "next/server";

import { commercialPlans, getCommercialPaymentAssets, trialRestrictions } from "@/lib/commercial-readiness";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      positioning:
        "PrivateDAO sells private governance, treasury coordination, reviews and approvals, organizational intelligence, and verifiable outcomes. Crypto payments activate subscriptions and pilots; they are not the core product.",
      trial: {
        days: 14,
        restrictions: trialRestrictions,
      },
      plans: commercialPlans,
      paymentAssets: getCommercialPaymentAssets().map((asset) => ({
        ...asset,
        treasuryAddress: asset.configured ? asset.treasuryAddress : null,
      })),
      treasuryEnv: ["PD_SOLANA_TREASURY", "PD_ETHEREUM_TREASURY", "PD_BITCOIN_TREASURY", "PD_ZCASH_TREASURY"],
    },
    { status: 200 },
  );
}
