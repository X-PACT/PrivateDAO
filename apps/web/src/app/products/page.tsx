import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { OperationsShell } from "@/components/operations-shell";

export default function ProductsPage() {
  return (
    <OperationsShell
      eyebrow="Products"
      title="PrivateDAO product corridors, service packs, and buyer-facing offerings"
      description="This route collects the startup-facing product layer: service packages, buyer corridors, and the clearest explanation of what PrivateDAO sells and ships."
      badges={[
        { label: "Commercial-ready", variant: "cyan" },
        { label: "Buyer-first", variant: "success" },
      ]}
    >
      <SolutionCorridors />
      <ServicesSurface />
    </OperationsShell>
  );
}
