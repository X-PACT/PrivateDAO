import type { Metadata } from "next";

import { PrivateEngineControlCenter } from "@/components/private-engine-control-center";
import { OperationsShell } from "@/components/operations-shell";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Engine Admin",
  description: "Local administration dashboard for the customer-hosted PrivateDAO Blind Verification Engine.",
  path: "/admin/private-engine",
  keywords: ["PrivateDAO admin", "self-hosted proof engine", "enterprise license", "local Groth16"],
});

export default function PrivateEngineAdminPage() {
  return (
    <OperationsShell
      eyebrow="Enterprise deployment"
      title="Private Engine Admin"
      description="Monitor workflows, receipts, license state, limits, and the local privacy boundary from inside the organization deployment."
      navigationMode="focused"
      badges={[{ label: "Self-hosted", variant: "cyan" }, { label: "Offline-capable", variant: "success" }]}
    >
      <PrivateEngineControlCenter />
    </OperationsShell>
  );
}
