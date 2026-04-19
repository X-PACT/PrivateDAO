import type { Metadata } from "next";

import { TemplateSandboxShell } from "@/components/template-sandbox-shell";
import { WalletTemplateSandbox } from "@/components/wallet-template-sandbox";
import { buildRouteMetadata } from "@/lib/route-metadata";

const templateHref =
  "https://github.com/X-PACT/PrivateDAO/tree/main/templates/frontend-solana-bootcamp/wallet-connect-starter/WalletConnectStarter.tsx";

export const metadata: Metadata = buildRouteMetadata({
  title: "Wallet Template",
  description: "Wallet-first starter sandbox for connecting a Testnet wallet and entering the PrivateDAO product corridor.",
  path: "/wallet-template",
  keywords: ["wallet template", "solana wallet ux", "private dao toolkit"],
  index: false,
});

export default function WalletTemplatePage() {
  return (
    <TemplateSandboxShell
      eyebrow="Wallet Template"
      title="A wallet-first sandbox that opens the real Testnet entry lane"
      description="Use this route to test the starter shell, connect a real wallet, understand signer context, and move into the live Start or Govern product surfaces without leaving the learning corridor."
      badges={[
        { label: "Starter sandbox", variant: "cyan" },
        { label: "Wallet-first", variant: "success" },
        { label: "Testnet ready", variant: "violet" },
      ]}
      templateAlias="wallet-template"
      lessonHref="/learn/lecture-1-web2-to-solana-ui"
      lessonLabel="Open Lesson 1"
      liveHref="/start"
      liveLabel="Run Start on Testnet"
      verifyHref="/dashboard"
      verifyLabel="Open live operator state"
      templateHref={templateHref}
      focusPoints={[
        "Open the real wallet modal from the browser and confirm that signer context is visible immediately.",
        "Move the connected user into the correct corridor without asking them for terminal setup or handwritten addresses.",
        "Use the same wallet shell pattern later in governance, payments, and operator review lanes.",
      ]}
    >
      <WalletTemplateSandbox />
    </TemplateSandboxShell>
  );
}
