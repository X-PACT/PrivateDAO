import type { Metadata } from "next";
import { Suspense } from "react";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateRoomEntry } from "@/components/private-room-entry";
import { buildRouteMetadata } from "@/lib/route-metadata";

export function generateStaticParams() {
  return [{ roomId: "demo-room" }];
}

export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params;
  return buildRouteMetadata({
    title: "Private Room",
    description: "PrivateDAO invitation gate. Private room names and contents are not publicly discoverable.",
    path: `/rooms/${roomId}`,
    index: false,
  });
}

export default function RoomPage() {
  return (
    <OperationsShell eyebrow="Private room" title="Invitation required" description="Private room names, members, notes, and proposals are not publicly discoverable. Open the invitation sent by the room creator." navigationMode="focused">
      <Suspense fallback={null}>
        <PrivateRoomEntry mode="join" />
      </Suspense>
    </OperationsShell>
  );
}
