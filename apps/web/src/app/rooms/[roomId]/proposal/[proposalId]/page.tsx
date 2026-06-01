import type { Metadata } from "next";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return [{ roomId: "demo-room", proposalId: "demo-proposal" }];
}

export async function generateMetadata({ params }: { params: Promise<{ roomId: string; proposalId: string }> }): Promise<Metadata> {
  const { roomId, proposalId } = await params;
  return buildRouteMetadata({
    title: "Private Room Proposal",
    description: `PrivateDAO room proposal ${proposalId} in ${roomId}.`,
    path: `/rooms/${roomId}/proposal/${proposalId}`,
    index: false,
  });
}

export default async function RoomProposalPage({ params }: { params: Promise<{ roomId: string; proposalId: string }> }) {
  const { roomId, proposalId } = await params;
  return (
    <OperationsShell eyebrow="Room proposal" title="Private vote, reveal, and proof export" description="Counts, percentages, identities, and vote intent stay hidden until the room reveal policy allows disclosure." navigationMode="guided">
      <section className="rounded-[30px] border border-violet-300/18 bg-violet-300/[0.08] p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {["Private vote active", "Influence hidden", "Reveal controlled", "Proof export ready"].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-black/22 p-4">
              <div className="text-base font-semibold text-white">{item}</div>
              <p className="mt-2 text-sm leading-6 text-white/58">{roomId} / {proposalId}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/govern#commit-vote-action" className={cn(buttonVariants({ size: "sm" }))}>Cast private vote</Link>
          <Link href="/proof/?room=1" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Export proof</Link>
        </div>
      </section>
    </OperationsShell>
  );
}
