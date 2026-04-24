import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Gaming Guild Hub",
  description:
    "Guild governance hub for tournament operations, rewards, and treasury-linked game economy flow.",
  path: "/gaming",
  keywords: ["gaming dao", "guild", "tournament", "rewards", "solana"],
});

export default function GamingPage() {
  return (
    <OperationsShell
      eyebrow="Gaming"
      title="Guild operations with private rewards and governed treasury"
      description="Create guild governance intent, manage tournament flow, and keep reward distribution tied to proof-ready execution."
      badges={[
        { label: "Guild hub", variant: "violet" },
        { label: "Private rewards", variant: "success" },
        { label: "Governed", variant: "cyan" },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Create Guild</div>
          <p className="mt-2 text-sm leading-7 text-white/65">
            Use the same governance rails to bootstrap a guild treasury and proposal policy.
          </p>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm" }), "mt-4 w-full")}>
            Create DAO/Guild
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Guild Members</div>
          <p className="mt-2 text-sm leading-7 text-white/65">Membership and voting posture are managed inside governance policy packs.</p>
          <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full")}>
            Manage members
          </Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-base font-medium text-white">Guild Treasury</div>
          <p className="mt-2 text-sm leading-7 text-white/65">Track reward reserves and tournament pools from treasury intelligence route.</p>
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

