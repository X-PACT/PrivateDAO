import { NextResponse } from "next/server";

import { getOraclePriceProvider } from "@/lib/oracle/oracle-price-provider";
import { getConfidentialVestingProvider } from "@/lib/providers/confidential-vesting-provider";
import { getPrivatePayoutProviderStatuses } from "@/lib/providers/private-payout-registry";
import { getTokenIntelligenceProvider } from "@/lib/tokens/token-intelligence-provider";

export const dynamic = "force-static";

export async function GET() {
  const tokenProvider = getTokenIntelligenceProvider();
  const priceProvider = getOraclePriceProvider();
  const vestingProvider = getConfidentialVestingProvider();
  const payoutProviders = await getPrivatePayoutProviderStatuses();

  return NextResponse.json({
    ok: true,
    productFrame: "Confidential Coordination Infrastructure for Organizations on Solana.",
    userVisibleFlow: "Context before decisions, private coordination during decisions, public proof after execution.",
    providers: {
      assetContext: tokenProvider.getStatus(),
      priceContext: priceProvider.getStatus(),
      privatePayout: payoutProviders,
      confidentialVesting: vestingProvider.getStatus(),
      magicBlockPrivatePayments: {
        configured: true,
        route: "https://privatedao.org/services/magicblock-private-payments/",
        proofEndpoint: "https://api.privatedao.org/api/v1/magicblock/onchain-proof",
        healthEndpoint: "https://api.privatedao.org/api/v1/magicblock/health",
        engineeringReport: "https://privatedao.org/documents/magicblock-engineering-report-2026-06-11/",
        executionMode: "proposal-bound private payment corridor with on-chain settlement evidence",
        privacyBoundary:
          "Public proof verifies the corridor PDA and finalized settlement receipts; private balances remain behind MagicBlock challenge/login and wallet authorization.",
        protocolBoundary:
          "Current implementation is a MagicBlock Payments API plus PrivateDAO on-chain corridor gate; ER/PER-native account delegation is the next protocol-deepening step.",
      },
    },
  });
}
