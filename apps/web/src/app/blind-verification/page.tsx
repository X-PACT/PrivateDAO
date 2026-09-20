import type { Metadata } from "next";

import ProofWorkflowsPage from "@/app/proof-workflows/page";
import { ProductSeo } from "@/components/product-seo";
import { buildRouteMetadata } from "@/lib/route-metadata";

const description = "Verify that a policy, decision, or workflow condition was satisfied without exposing the sensitive source data.";

export const metadata: Metadata = buildRouteMetadata({
  title: "Blind Verification",
  description,
  path: "/blind-verification",
  image: "/assets/social/verification.png",
  keywords: ["blind verification", "privacy-preserving verification", "proof without exposure", "verifiable claims"],
});

export default function BlindVerificationPage() {
  return <ProductSeo name="Blind Verification" description={description} path="/blind-verification" category="BusinessApplication"><ProofWorkflowsPage /></ProductSeo>;
}
