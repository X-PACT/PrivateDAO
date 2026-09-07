import type { Metadata } from "next";
import { Suspense } from "react";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateRoomEntry } from "@/components/private-room-entry";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Create Private Room",
  description: "Create an invite-only, token-gated, or allowlist PrivateDAO room.",
  path: "/rooms/new",
  keywords: ["create private room", "invite only dao", "vip private room"],
});

export default function NewRoomPage() {
  return (
    <OperationsShell eyebrow="New room" title="Create a private room" description="Name the room, choose its access policy, then share a generated invitation code, link, or QR. The room name is not exposed publicly." navigationMode="focused">
      <Suspense fallback={null}>
        <PrivateRoomEntry mode="create" />
      </Suspense>
    </OperationsShell>
  );
}
