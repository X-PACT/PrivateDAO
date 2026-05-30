import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateDaoStackSurface } from "@/components/private-dao-stack-surface";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Gaming Guild Hub",
  description:
    "GamingDAO hub for guild coordination, tournament reward governance, private winner payouts, inventory proposals, and proof-linked treasury operations.",
  path: "/gaming",
  keywords: ["gaming dao", "guild", "tournament", "private rewards", "inventory", "solana"],
});

export default function GamingPage() {
  return (
    <OperationsShell
      eyebrow="Gaming"
      title="GamingDAO coordination with private rewards and governed treasury"
      description="Create guild intent, authorize tournament flow, prepare reward distribution through the same encrypted treasury rails, and keep the result tied to proof-ready Testnet execution."
      badges={[
        { label: "Guild hub", variant: "violet" },
        { label: "Private rewards", variant: "success" },
        { label: "Governed", variant: "cyan" },
      ]}
    >
      <PrivateDaoStackSurface compact />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Coordinate Guild</div>
          <p className="mt-2 text-sm leading-7 text-white/65">
            Use the same coordination core to bootstrap a guild treasury, proposal policy, and reward authority.
          </p>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full")}>
            Open coordination core
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Guild Members</div>
          <p className="mt-2 text-sm leading-7 text-white/65">Membership, voting posture, and agent permissions are managed inside governance policy packs.</p>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full")}>
            Manage members
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Guild Treasury</div>
          <p className="mt-2 text-sm leading-7 text-white/65">Track reward reserves, tournament pools, and encrypted payout readiness from treasury intelligence.</p>
          <Link href="/treasury" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full")}>
            Open treasury
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/gaming/tournaments" className={cn(buttonVariants({ size: "sm" }))}>
          Create tournament
        </Link>
        <Link href="/gaming/inventory" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open inventory
        </Link>
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open proof
        </Link>
      </div>
    </OperationsShell>
  );
}
