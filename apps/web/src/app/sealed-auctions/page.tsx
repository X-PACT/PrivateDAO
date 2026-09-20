import type { Metadata } from "next";

import AuctionsPage from "@/app/auctions/page";
import { ProductSeo } from "@/components/product-seo";
import { buildRouteMetadata } from "@/lib/route-metadata";

const description = "Run sealed procurement and private auctions where bids stay hidden until the result is ready to share.";

export const metadata: Metadata = buildRouteMetadata({
  title: "Sealed Auctions",
  description,
  path: "/sealed-auctions",
  image: "/assets/social/auctions.png",
  keywords: ["sealed auctions", "private procurement", "confidential bidding", "auction verification"],
});

export default function SealedAuctionsPage() {
  return <ProductSeo name="Sealed Auctions" description={description} path="/sealed-auctions" category="BusinessApplication"><AuctionsPage /></ProductSeo>;
}
