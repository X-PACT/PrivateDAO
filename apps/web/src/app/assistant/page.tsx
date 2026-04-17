import type { Metadata } from "next";

import { InternalAssistantPanel } from "@/components/internal-assistant-panel";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Assistant",
  description: "Built-in guide for users, reviewers, and operators to reach the right PrivateDAO route quickly.",
  path: "/assistant",
  keywords: ["assistant", "guide"],
  index: false,
});

export default function AssistantPage() {
  return (
    <OperationsShell
      eyebrow="Product Assistant"
      title="A built-in guide for users, reviewers, and operators"
      description="Use the product assistant to jump into the right PrivateDAO route immediately instead of navigating the whole site manually."
      badges={[
        { label: "Built into the product", variant: "cyan" },
        { label: "Wallet and proof aware", variant: "violet" },
      ]}
    >
      <InternalAssistantPanel />
    </OperationsShell>
  );
}
