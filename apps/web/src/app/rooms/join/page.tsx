import type { Metadata } from "next";
import { Suspense } from "react";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateRoomEntry } from "@/components/private-room-entry";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Join Private Room",
  description: "Open a PrivateDAO room using a bearer invitation code without exposing the room name publicly.",
  path: "/rooms/join",
  keywords: ["join private room", "private dao invite", "confidential room"],
});

export default function JoinPrivateRoomPage() {
  return (
    <OperationsShell
      eyebrow="Private room invitation"
      title="Enter a room without making it discoverable"
      description="Private room names and member activity stay hidden. The invitation code is the access boundary."
      navigationMode="focused"
    >
      <Suspense fallback={null}>
        <PrivateRoomEntry mode="join" />
      </Suspense>
    </OperationsShell>
  );
}
