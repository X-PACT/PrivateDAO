import type { Metadata } from "next";

import { ArchivedRouteRedirect } from "@/components/archived-route-redirect";
import { buildRouteMetadata } from "@/lib/route-metadata";

type PageProps = { params: Promise<{ proofId: string }> };

export function generateStaticParams() {
  return [{ proofId: "demo-proof-id" }, { proofId: "txline-settlement-demo" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { proofId } = await params;
  return buildRouteMetadata({
    title: "Archived Verification Route",
    description: `This historical verification route is no longer part of the current product catalog (${proofId}).`,
    path: `/txline-settlement/verify/${proofId}`,
  });
}

export default function ArchivedTxlineVerifyRoute() {
  return <ArchivedRouteRedirect target="/products/" label="View the current product catalog" />;
}
