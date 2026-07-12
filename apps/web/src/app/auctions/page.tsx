import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { SealedAuctionWorkbench } from "@/components/sealed-auction-workbench";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Sealed Auctions",
  description: "Run public or private-room auctions where bidding intent stays hidden until reveal.",
  path: "/auctions",
  keywords: ["sealed auctions", "private auctions", "blind bidding", "MagicBlock auctions", "ZK auction proof"],
});

export default function AuctionsPage() {
  return (
    <OperationsShell
      eyebrow="Sealed Auctions"
      title="Run auctions without exposing bidding intent."
      description="Create public or private-room auctions with sealed bids, invite access, required deposits, reveal, and public proof verification."
      navigationMode="guided"
      badges={[
        { label: "Hidden intent", variant: "violet" },
        { label: "MagicBlock session lane", variant: "cyan" },
        { label: "Proof after reveal", variant: "success" },
      ]}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-red-300/16 bg-red-400/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-red-100/76">Problem</div>
          <p className="mt-3 text-sm leading-7 text-white/68">
            Normal auctions leak momentum. Bidders can see pressure, infer strategy, and react to public signals before
            the auction is over.
          </p>
        </article>
        <article className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">With PrivateDAO</div>
          <p className="mt-3 text-sm leading-7 text-white/68">
            Bids are committed while the auction is active. The winner and proof are revealed after the bidding window,
            without exposing intent during the process.
          </p>
        </article>
      </section>

      <SealedAuctionWorkbench />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/42">Commercial use</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Use sealed auctions for more than collectibles.</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Grant allocation", "Let reviewers submit allocation bids without revealing momentum."],
            ["Vendor selection", "Run sealed commercial bidding with proof after selection."],
            ["GamingDAO", "Run tournaments, item auctions, and reward auctions without early leader pressure."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-black/18 p-4">
              <div className="font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="mailto:Fahd.kotb@tuta.io?subject=PrivateDAO%20Sealed%20Auction%20Pilot" className={cn(buttonVariants({ size: "sm" }))}>
            Request Auction Pilot
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/pricing" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            View pricing
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
