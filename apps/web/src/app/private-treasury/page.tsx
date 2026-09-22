import type { Metadata } from "next";

import TreasuryPage from "@/app/treasury/page";
import { ProductSeo } from "@/components/product-seo";
import { buildRouteMetadata } from "@/lib/route-metadata";

const description = "Coordinate private spending requests, approvals, budgets, settlement, and reviewable treasury outcomes.";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Treasury",
  description,
  path: "/private-treasury",
  image: "/assets/social/treasury.png",
  keywords: ["private treasury", "treasury coordination", "spending approvals", "treasury workflow"],
});

export default function PrivateTreasuryPage() {
  return <ProductSeo name="Private Treasury" description={description} path="/private-treasury" category="BusinessApplication"><TreasuryPage /></ProductSeo>;
}
