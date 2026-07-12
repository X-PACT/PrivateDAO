import type { Metadata } from "next";

import { OperationsShell } from "@/components/operations-shell";
import { ProofWorkflowDemo } from "@/components/proof-workflow-demo";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Workflows Demo",
  description: "Run a 60-second Credit Limit Workflow demo and verify the proof publicly without exposing private values.",
  path: "/proof-workflows/demo",
  keywords: ["proof workflow demo", "credit limit proof", "underwriting proof", "private verification demo"],
});

export default function ProofWorkflowsDemoPage() {
  return (
    <OperationsShell
      eyebrow="60-second demo"
      title="Run a credit limit workflow. Verify the proof. Keep the private values hidden."
      description="A first-time customer can see the value immediately: private data stays private, while process execution becomes publicly verifiable."
      navigationMode="guided"
      badges={[
        { label: "Self-guided", variant: "success" },
        { label: "No docs required", variant: "cyan" },
        { label: "Public verify link", variant: "violet" },
      ]}
    >
      <ProofWorkflowDemo />
    </OperationsShell>
  );
}
