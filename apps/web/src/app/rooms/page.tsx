import type { Metadata } from "next";
import { Suspense } from "react";

import { OperationsShell } from "@/components/operations-shell";
import { PrivateRoomEntry } from "@/components/private-room-entry";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Rooms",
  description: "Create invite-only, token-gated, or allowlist private DAO rooms for private proposals, private voting, reveal, and proof export.",
  path: "/rooms",
  keywords: ["private rooms", "vip private room", "private dao workspace"],
});

export default function RoomsPage() {
  return (
    <OperationsShell
      eyebrow="Private rooms"
      title="Create private room → invite members → vote privately → reveal outcome → export proof"
      description="Private room names, members, notes, and vote intent are not publicly discoverable. Enter with an invitation code, or create a new room and share its secure invite."
      navigationMode="focused"
      badges={[
        { label: "Invite-only", variant: "cyan" },
        { label: "No jargon", variant: "success" },
        { label: "Proof export", variant: "violet" },
      ]}
    >
      <Suspense fallback={null}>
        <PrivateRoomEntry mode="join" />
      </Suspense>
    </OperationsShell>
  );
}
