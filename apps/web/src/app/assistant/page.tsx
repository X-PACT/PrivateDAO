import { InternalAssistantPanel } from "@/components/internal-assistant-panel";
import { OperationsShell } from "@/components/operations-shell";

export default function AssistantPage() {
  return (
    <OperationsShell
      eyebrow="Internal Assistant"
      title="A built-in guide for users, judges, operators, and competition reviewers"
      description="Use the internal assistant to jump into the right PrivateDAO route immediately instead of navigating the whole site manually."
      badges={[
        { label: "Built into the product", variant: "cyan" },
        { label: "Wallet and proof aware", variant: "violet" },
      ]}
    >
      <InternalAssistantPanel />
    </OperationsShell>
  );
}
