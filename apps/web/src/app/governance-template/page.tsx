import type { Metadata } from "next";

import { GovernanceTemplateSandbox } from "@/components/governance-template-sandbox";
import { TemplateSandboxShell } from "@/components/template-sandbox-shell";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

const templateHref =
  "https://github.com/X-PACT/PrivateDAO/tree/main/templates/frontend-solana-bootcamp/proposal-ui-starter/ProposalUiStarter.tsx";

function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export const metadata: Metadata = buildRouteMetadata({
  title: "Governance Template",
  description: "Governance starter sandbox for proposal creation, commit-reveal voting, and proof-linked execution in PrivateDAO.",
  path: "/governance-template",
  keywords: ["governance template", "commit reveal ui", "private dao governance starter"],
  index: false,
});

export default function GovernanceTemplatePage() {
  const snapshot = getJudgeRuntimeLogsSnapshot();
  const recentEntry =
    snapshot.governance.entries.find((entry) => entry.label === "execute") ?? snapshot.governance.entries.at(-1) ?? snapshot.governance.entries[0];

  return (
    <TemplateSandboxShell
      eyebrow="Governance Template"
      title="A governance sandbox that teaches the lifecycle without hiding the live route"
      description="This route turns the proposal starter into a visible lifecycle practice lane, then hands the user straight into Govern and Judge for the real Devnet execution and verification path."
      badges={[
        { label: "Lifecycle sandbox", variant: "cyan" },
        { label: "Commit-reveal", variant: "violet" },
        { label: "Judge linked", variant: "success" },
      ]}
      templateAlias="governance-template"
      lessonHref="/learn/lecture-2-governance-ui"
      lessonLabel="Open Lesson 2"
      liveHref="/govern"
      liveLabel="Run Govern on Devnet"
      verifyHref="/judge"
      verifyLabel="Open Judge"
      templateHref={templateHref}
      focusPoints={[
        "Show a normal operator what changes between draft, commit, reveal, and execution states without leaking the actual live vote too early.",
        "Keep the real wallet-bound actions in Govern, where the proposal lifecycle is executed and then sent to Judge and Proof.",
        "Use a recent verified Devnet signature to anchor the explanation in something concrete, not a toy timeline.",
      ]}
    >
      <GovernanceTemplateSandbox
        recentSignature={recentEntry?.signature ?? "No verified governance signature available yet."}
        recentExplorerUrl={recentEntry ? buildSolanaTxUrl(recentEntry.signature) : "https://privatedao.org/judge/"}
      />
    </TemplateSandboxShell>
  );
}
