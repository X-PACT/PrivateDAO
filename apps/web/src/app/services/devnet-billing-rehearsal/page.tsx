import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Testnet Billing Rehearsal Alias",
  description:
    "Legacy billing route redirected to the current PrivateDAO Testnet billing rehearsal.",
  path: "/services/devnet-billing-rehearsal",
  keywords: ["testnet billing", "solana payment rehearsal", "web3 business model", "wallet billing"],
  index: false,
});

export default function DevnetBillingRehearsalAliasPage() {
  permanentRedirect("/services/testnet-billing-rehearsal");
}
