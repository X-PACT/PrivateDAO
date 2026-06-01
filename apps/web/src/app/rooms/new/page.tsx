import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Create Private Room",
  description: "Create an invite-only, token-gated, or allowlist PrivateDAO room.",
  path: "/rooms/new",
  keywords: ["create private room", "invite only dao", "vip private room"],
});

export default function NewRoomPage() {
  return (
    <OperationsShell eyebrow="New room" title="Create a private room" description="Choose the room mode, invite members, and keep room details hidden from unauthorized wallets." navigationMode="guided">
      <section className="rounded-[30px] border border-emerald-300/18 bg-emerald-300/[0.08] p-5 md:p-6">
        <div className="flex flex-wrap gap-3">
          <WalletConnectButton connectLabel="Connect wallet to create room" />
          <Link href="/rooms/demo-room" className={cn(buttonVariants({ size: "sm" }))}>Preview room shell</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {["Invite-only", "Token-gated", "Allowlist"].map((mode) => (
            <div key={mode} className="rounded-[22px] border border-white/10 bg-black/22 p-4">
              <div className="text-base font-semibold text-white">{mode}</div>
              <p className="mt-2 text-sm leading-6 text-white/58">Room details remain hidden unless the connected wallet passes policy.</p>
            </div>
          ))}
        </div>
      </section>
    </OperationsShell>
  );
}
