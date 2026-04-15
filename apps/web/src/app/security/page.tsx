import type { Metadata } from "next";

import { MetricsStrip } from "@/components/metrics-strip";
import { MainnetExecutionScorecardPanel } from "@/components/mainnet-execution-scorecard-panel";
import { AuthorityHardeningPanel } from "@/components/authority-hardening-panel";
import { ConfidenceEngineSurface } from "@/components/confidence-engine-surface";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { CustodyWorkspace } from "@/components/custody-workspace";
import { FrontierSignalBoard } from "@/components/frontier-signal-board";
import { IntelligenceLayerSurface } from "@/components/intelligence-layer-surface";
import { OperationsShell } from "@/components/operations-shell";
import { RealDeviceWalletMatrixPanel } from "@/components/real-device-wallet-matrix-panel";
import { RuntimeOperationsReadinessPanel } from "@/components/runtime-operations-readiness-panel";
import { SecurityCenter } from "@/components/security-center";
import { SectionHeader } from "@/components/section-header";
import { ZkMatrixSurface } from "@/components/zk-matrix-surface";
import { ConfidentialPayoutEvidenceStrip } from "@/components/confidential-payout-evidence-strip";
import { SettlementReceiptSurface } from "@/components/settlement-receipt-surface";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Security",
  description:
    "Security architecture, additive V3 hardening, integrations, and explicit launch boundaries presented as a first-class product surface.",
  path: "/security",
  keywords: ["security", "governance hardening v3", "settlement hardening v3", "launch boundary"],
});

export default function SecurityPage() {
  return (
    <OperationsShell
      eyebrow="Security"
      title="A security surface that keeps hardening, proof, and launch boundaries together"
      description="The security story stays productized without flattening the truth: additive V3 hardening, integration rails, audit packets, launch blockers, and the cryptographic rails behind the protocol."
      badges={[
        { label: "Security", variant: "violet" },
        { label: "Additive hardening", variant: "success" },
        { label: "ZK + REFHE + MagicBlock", variant: "cyan" },
      ]}
    >
      <div>
        <MetricsStrip />
      </div>
      <div>
        <CustodyReadinessStrip context="security" />
      </div>
      <div>
        <SecurityCenter />
      </div>
      <div>
        <AuthorityHardeningPanel />
      </div>
      <div>
        <CustodyWorkspace />
      </div>
      <div>
        <SectionHeader
          eyebrow="2026 operating reality"
          title="Security posture now has to survive real-world signer attacks, not only audit checklists"
          description="The Drift exploit and STRIDE response changed what serious judges expect. PrivateDAO keeps signer discipline, launch blockers, runtime visibility, and migration-safe hardening in the product surface instead of hiding them in ops notes."
        />
      </div>
      <div>
        <FrontierSignalBoard />
      </div>
      <div>
        <SectionHeader
          eyebrow="ZK Matrix"
          title="A PrivateDAO-specific matrix for what ZK proves now and what it does not claim"
          description="This matrix turns the ZK story into a reviewer-friendly surface: live proofs, proposal-bound anchors, attestation, and zk_enforced posture on one side, with explicit non-claims on the other."
        />
      </div>
      <div>
        <ZkMatrixSurface />
      </div>
      <div>
        <SectionHeader
          eyebrow="Confidence Engine"
          title="A deterministic scoring engine for ZK, REFHE, MagicBlock, and Fast RPC"
          description="This surface does not claim magical security. It explains, with explicit weights, why one proposal pattern has stronger privacy depth, enforcement depth, execution integrity, or reviewer confidence than another."
        />
      </div>
      <div>
        <ConfidenceEngineSurface />
      </div>
      <div>
        <ConfidentialPayoutEvidenceStrip />
      </div>
      <div>
        <SettlementReceiptSurface />
      </div>
      <div>
        <RuntimeOperationsReadinessPanel />
      </div>
      <div>
        <RealDeviceWalletMatrixPanel />
      </div>
      <div>
        <MainnetExecutionScorecardPanel />
      </div>
      <div>
        <SectionHeader
          eyebrow="Security + Intelligence"
          title="Proposal, treasury, voting, RPC, and gaming analysis belong inside the security story"
          description="PrivateDAO should help users detect abnormal treasury motions, summarize governance discussion, and interpret runtime health before signatures happen. This is where AI-style assistance becomes operational instead of cosmetic."
        />
      </div>
      <div>
        <IntelligenceLayerSurface />
      </div>
    </OperationsShell>
  );
}
