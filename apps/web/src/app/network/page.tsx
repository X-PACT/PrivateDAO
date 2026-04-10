import { DiagnosticsCenter } from "@/components/diagnostics-center";
import { FrontierSignalBoard } from "@/components/frontier-signal-board";
import { ProofCenter } from "@/components/proof-center";
import { SecurityCenter } from "@/components/security-center";
import { OperationsShell } from "@/components/operations-shell";

export default function NetworkPage() {
  return (
    <OperationsShell
      eyebrow="Network"
      title="Proof, security, diagnostics, and runtime surfaces for the live Devnet system"
      description="This route groups the network-grade layer: proof, security, diagnostics, reviewer paths, and runtime trust surfaces across the PrivateDAO stack."
      badges={[
        { label: "Proof and runtime", variant: "cyan" },
        { label: "ZK + REFHE + MagicBlock + Fast RPC", variant: "violet" },
        { label: "Competition-sensitive", variant: "success" },
      ]}
    >
      <FrontierSignalBoard />
      <ProofCenter />
      <SecurityCenter />
      <DiagnosticsCenter />
    </OperationsShell>
  );
}
