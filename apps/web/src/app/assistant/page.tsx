import type { Metadata } from "next";

import { InternalAssistantPanel } from "@/components/internal-assistant-panel";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Assistant",
  description: "A simple PrivateDAO guide that helps you choose the right product and next step.",
  path: "/assistant",
  keywords: ["assistant", "product guide", "PrivateDAO products", "business workflows"],
});

export default function AssistantPage() {
  return (
    <OperationsShell
      eyebrow="Product Assistant"
      title="Tell us what you need"
      description="Ask a simple question and get the clearest PrivateDAO starting point for your organization."
      badges={[
        { label: "Built into the product", variant: "cyan" },
        { label: "Simple product guidance", variant: "success" },
      ]}
    >
      <InternalAssistantPanel />
    </OperationsShell>
  );
}
