import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return [{ roomId: "demo-room" }];
}

export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params;
  return buildRouteMetadata({
    title: "Private Room",
    description: `PrivateDAO room ${roomId}. Unauthorized wallets see only the public room label.`,
    path: `/rooms/${roomId}`,
    index: false,
  });
}

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return (
    <OperationsShell eyebrow="Private room" title="Private room workspace" description="Connect a wallet to check access. Public visitors only see this label, not room contents." navigationMode="guided">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Public label</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">{roomId}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">Room metadata, notes, invite lists, and proposal contents require wallet membership. Intelligence providers receive no private notes by default.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <WalletConnectButton connectLabel="Connect to check access" />
          <Link href={`/rooms/${roomId}/proposal/demo-proposal`} className={cn(buttonVariants({ size: "sm" }))}>Open proposal shell</Link>
        </div>
      </section>
    </OperationsShell>
  );
}
