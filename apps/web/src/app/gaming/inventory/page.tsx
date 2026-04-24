import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

const SAMPLE_NFTS = [
  { mint: "8d6v...kWm9", name: "Guild Pass Alpha" },
  { mint: "6RG4...s2Aq", name: "Tournament Trophy #12" },
  { mint: "C3m7...pLx1", name: "Season Badge Genesis" },
];

export const metadata: Metadata = buildRouteMetadata({
  title: "Gaming Inventory",
  description: "Inventory route for guild NFTs and proposal-based transfer actions.",
  path: "/gaming/inventory",
  keywords: ["gaming", "inventory", "nft", "guild", "solana"],
});

export default function GamingInventoryPage() {
  return (
    <OperationsShell
      eyebrow="Gaming inventory"
      title="Manage guild assets and route transfers through governance"
      description="Track core gaming NFTs and send transfer motions through proposal flow instead of direct opaque movement."
      badges={[{ label: "NFT assets", variant: "violet" }, { label: "Governed transfer", variant: "cyan" }]}
    >
      <div className="grid gap-3">
        {SAMPLE_NFTS.map((item) => (
          <div key={item.mint} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-base font-medium text-white">{item.name}</div>
            <div className="mt-2 text-sm text-white/65">Mint: {item.mint}</div>
            <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4")}>
              Propose transfer
            </Link>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}

