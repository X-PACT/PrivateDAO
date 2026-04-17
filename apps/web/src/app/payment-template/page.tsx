import type { Metadata } from "next";

import { PaymentTemplateSandbox } from "@/components/payment-template-sandbox";
import { TemplateSandboxShell } from "@/components/template-sandbox-shell";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

const templateHref =
  "https://github.com/X-PACT/PrivateDAO/tree/main/templates/frontend-solana-bootcamp/private-payment-starter/PrivatePaymentStarter.tsx";

function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export const metadata: Metadata = buildRouteMetadata({
  title: "Payment Template",
  description: "Private payment starter sandbox for confidential treasury requests, proof-linked verification, and operator-safe wording.",
  path: "/payment-template",
  keywords: ["payment template", "confidential payout starter", "private dao payments"],
  index: false,
});

export default function PaymentTemplatePage() {
  const snapshot = getJudgeRuntimeLogsSnapshot();
  const paymentEntry =
    snapshot.agenticMicropayments.entries.find((entry) => entry.label === "execute-settled") ??
    snapshot.confidential.entries.find((entry) => entry.label === "magicblock-execute") ??
    snapshot.agenticMicropayments.entries[0] ??
    snapshot.confidential.entries.at(-1) ??
    snapshot.confidential.entries[0];

  return (
    <TemplateSandboxShell
      eyebrow="Payment Template"
      title="A payment sandbox that teaches confidential operations in plain language"
      description="This route trains the operator-facing payment story: what stays confidential, what becomes public, and how to move from an easy UI explanation into the real payment, proof, and explorer lanes on Devnet."
      badges={[
        { label: "Confidential operations", variant: "violet" },
        { label: "Proof linked", variant: "success" },
        { label: "Agentic rail aware", variant: "cyan" },
      ]}
      templateAlias="payment-template"
      lessonHref="/learn/lecture-4-private-payments-gaming-and-proof"
      lessonLabel="Open Lesson 4"
      liveHref="/security"
      liveLabel="Open Security"
      verifyHref="/proof?judge=1"
      verifyLabel="Open Proof"
      templateHref={templateHref}
      focusPoints={[
        "Explain privacy in human terms before the user ever sees a proof route, ZK note, or explorer link.",
        "Keep the public verification path one click away so a reviewer can confirm the evidence immediately after reading the explanation.",
        "Tie the payment starter to the existing agentic treasury rail and confidential payout evidence already recorded on Devnet.",
      ]}
    >
      <PaymentTemplateSandbox
        proofSignature={paymentEntry?.signature ?? "No verified payment signature available yet."}
        explorerUrl={paymentEntry ? buildSolanaTxUrl(paymentEntry.signature) : "https://privatedao.org/proof/?judge=1"}
      />
    </TemplateSandboxShell>
  );
}
