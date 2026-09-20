import type { Metadata } from "next";

import GovernPage from "@/app/govern/page";
import { ProductSeo } from "@/components/product-seo";
import { buildRouteMetadata } from "@/lib/route-metadata";

const description = "Run private organizational decisions, committee votes, DAO governance, and approvals with verifiable outcomes.";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Governance",
  description,
  path: "/private-governance",
  image: "/assets/social/governance.png",
  keywords: ["private governance", "private voting", "DAO governance", "committee approvals"],
});

export default function PrivateGovernancePage() {
  return <ProductSeo name="Private Governance" description={description} path="/private-governance" category="BusinessApplication"><GovernPage /></ProductSeo>;
}
