import type { Metadata } from "next";

import { RuntimeTemplateSandbox } from "@/components/runtime-template-sandbox";
import { TemplateSandboxShell } from "@/components/template-sandbox-shell";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { buildSolanaTxUrl } from "@/lib/solana-network";

const templateHref =
  "https://github.com/X-PACT/PrivateDAO/tree/main/templates/frontend-solana-bootcamp/runtime-activity-starter/RuntimeActivityStarter.tsx";

export const metadata: Metadata = buildRouteMetadata({
  title: "Runtime Template",
  description: "Runtime activity starter sandbox for hashes, status, diagnostics, and proof-aware Solana UX.",
  path: "/runtime-template",
  keywords: ["runtime template", "solana activity widget", "private dao runtime starter"],
  index: false,
});

export default function RuntimeTemplatePage() {
  const snapshot = getJudgeRuntimeLogsSnapshot();
  const runtimeEntry =
    snapshot.governance.entries.find((entry) => entry.label === "execute") ??
    snapshot.agenticMicropayments.entries[0] ??
    snapshot.governance.entries.at(-1) ??
    snapshot.governance.entries[0];

  return (
    <TemplateSandboxShell
      eyebrow="Runtime Template"
      title="A runtime sandbox that teaches what happens after the wallet signs"
      description="This route shows the exact UI pattern PrivateDAO uses after a wallet action: transaction hash, status, freshness, and the next verification step. The learner can then jump into Dashboard or Diagnostics for the full product view."
      badges={[
        { label: "Runtime visibility", variant: "cyan" },
        { label: "Explorer linked", variant: "success" },
        { label: "Diagnostics aware", variant: "violet" },
      ]}
      templateAlias="runtime-template"
      lessonHref="/learn/lecture-3-rpc-state-and-runtime"
      lessonLabel="Open Lesson 3"
      liveHref="/dashboard"
      liveLabel="Open Dashboard"
      verifyHref="/diagnostics"
      verifyLabel="Open Diagnostics"
      templateHref={templateHref}
      focusPoints={[
        "Teach builders that a Solana UI cannot stop at a success toast after signature submission.",
        "Expose the current hash and status so a reviewer or operator can verify the exact on-chain event immediately.",
        "Move from this starter into Dashboard and Diagnostics, where the product surfaces the full runtime trail.",
      ]}
    >
      <RuntimeTemplateSandbox
        latestAction={runtimeEntry?.label ?? "No recent action"}
        signature={runtimeEntry?.signature ?? "No verified signature available yet."}
        status={runtimeEntry?.status ?? "Status unavailable"}
        explorerUrl={runtimeEntry ? buildSolanaTxUrl(runtimeEntry.signature) : "https://privatedao.org/judge/"}
        freshness={snapshot.freshness}
      />
    </TemplateSandboxShell>
  );
}
