import type { Metadata } from "next";
import { Suspense } from "react";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateRoomEntry } from "@/components/private-room-entry";
import { buildRouteMetadata } from "@/lib/route-metadata";

export function generateStaticParams() {
  return [{ roomId: "demo-room", proposalId: "demo-proposal" }];
}

export async function generateMetadata({ params }: { params: Promise<{ roomId: string; proposalId: string }> }): Promise<Metadata> {
  const { roomId, proposalId } = await params;
  return buildRouteMetadata({
    title: "Private Room Proposal",
    description: "PrivateDAO invitation gate. Private room proposals remain hidden until an invitation is opened.",
    path: `/rooms/${roomId}/proposal/${proposalId}`,
    index: false,
  });
}

export default function RoomProposalPage() {
  return (
    <OperationsShell eyebrow="Room proposal" title="Invitation required" description="Proposal title, vote intent, counts, percentages, identities, and discussion remain hidden until the room policy allows disclosure." navigationMode="focused">
      <Suspense fallback={null}>
        <PrivateRoomEntry mode="join" />
      </Suspense>
    </OperationsShell>
  );
}
