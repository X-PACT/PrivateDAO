"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, QrCode, ShieldCheck, Smartphone, WalletCards } from "lucide-react";

import { WalletConnectButton } from "@/components/wallet-connect-button";
import { buttonVariants } from "@/components/ui/button";
import { persistOperationReceipt } from "@/lib/supabase/operation-receipts";
import { SOLANA_NETWORK_LABEL } from "@/lib/solana-network";
import { cn } from "@/lib/utils";

const PARTNERS = ["Solflare", "Kamino", "DFlow", "QuickNode"] as const;

const USE_CASES = [
  "Private treasury operation",
  "Payroll and vendor settlement",
  "Treasury rebalance preview",
  "Gaming rewards execution",
] as const;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function EitherwayLiveDappSurface() {
  const { connected, publicKey, signMessage } = useWallet();
  const [selectedPartner, setSelectedPartner] = useState<(typeof PARTNERS)[number]>("Solflare");
  const [selectedUseCase, setSelectedUseCase] = useState<(typeof USE_CASES)[number]>("Private treasury operation");
  const [status, setStatus] = useState<string>("Connect a wallet and sign a profile challenge to start the live dApp flow.");
  const [profileSignature, setProfileSignature] = useState<string>("");
  const [lastSignedAt, setLastSignedAt] = useState<string>("");

  const walletAddress = publicKey?.toBase58() ?? "";
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}` : "Not connected";

  const sessionLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  async function handleCreateProfile() {
    if (!connected || !publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!signMessage) {
      setStatus("Selected wallet does not expose message signing.");
      return;
    }

    const timestamp = new Date().toISOString();
    const challenge = [
      "PrivateDAO Eitherway Profile Challenge",
      `wallet=${publicKey.toBase58()}`,
      `network=${SOLANA_NETWORK_LABEL}`,
      `partner=${selectedPartner}`,
      `flow=${selectedUseCase}`,
      `time=${timestamp}`,
    ].join("\n");

    try {
      const signatureBytes = await signMessage(new TextEncoder().encode(challenge));
      const signature = bytesToHex(signatureBytes).slice(0, 64);
      setProfileSignature(signature);
      setLastSignedAt(timestamp);
      setStatus("Profile challenge signed. You can continue to Govern → Execute → Proof.");

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "pdao.eitherway.profile.v1",
          JSON.stringify({
            wallet: publicKey.toBase58(),
            partner: selectedPartner,
            flow: selectedUseCase,
            signature,
            signedAt: timestamp,
          }),
        );
      }

      await persistOperationReceipt({
        operationType: "eitherway_live_dapp_profile",
        proposalId: "eitherway-wallet-profile",
        daoAddress: publicKey.toBase58(),
        approvalState: "profile_signed",
        executionReference: signature,
        privateSettlementRail: "wallet_first",
        stablecoinSymbol: "USDC",
        auditMode: "wallet-first",
        recipientVisibility: "private_by_default",
        metadata: {
          partner: selectedPartner,
          flow: selectedUseCase,
          signedAt: timestamp,
        },
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile signing failed.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[28px] border border-cyan-300/18 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/84">Eitherway live dApp lane</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Wallet-first flow with real signature and real proof continuity</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/68">
          This lane closes the Eitherway requirement operationally: users connect a wallet, sign a profile challenge, and move
          into governed execution from the same interface.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <WalletConnectButton size="sm" variant="default" connectLabel={`Connect ${SOLANA_NETWORK_LABEL} Wallet`} />
          <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open govern
          </Link>
          <Link href="/execute" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open execute
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">Live configuration</div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm text-white/74">
              Partner lane
              <select
                className="rounded-xl border border-white/12 bg-[#07111d] px-3 py-2 text-white"
                value={selectedPartner}
                onChange={(event) => setSelectedPartner(event.target.value as (typeof PARTNERS)[number])}
              >
                {PARTNERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-white/74">
              User flow
              <select
                className="rounded-xl border border-white/12 bg-[#07111d] px-3 py-2 text-white"
                value={selectedUseCase}
                onChange={(event) => setSelectedUseCase(event.target.value as (typeof USE_CASES)[number])}
              >
                {USE_CASES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void handleCreateProfile()}
              className={cn(buttonVariants({ size: "sm" }), "w-full")}
            >
              Sign message and create app profile
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/66">
            <div>Wallet: <span className="text-white">{shortWallet}</span></div>
            <div>Network: <span className="text-white">{SOLANA_NETWORK_LABEL}</span></div>
            <div>Status: <span className="text-white">{status}</span></div>
            {profileSignature ? <div>Signature ref: <span className="text-white">{profileSignature}</span></div> : null}
            {lastSignedAt ? <div>Signed at: <span className="text-white">{lastSignedAt}</span></div> : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">Wallet UX checklist</div>
          <div className="mt-4 grid gap-3 text-sm text-white/68">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
              <WalletCards className="mb-2 h-4 w-4 text-cyan-100" />
              Wallet picker with logos, installed auto-detect, and fallback install/open links.
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
              <Smartphone className="mb-2 h-4 w-4 text-cyan-100" />
              Deep links for Phantom/Solflare and browser-return flow.
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
              <QrCode className="mb-2 h-4 w-4 text-cyan-100" />
              QR session handoff so users can continue in mobile wallet browser.
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
              <ShieldCheck className="mb-2 h-4 w-4 text-cyan-100" />
              Review-first, sign-second, verify-third flow with proof route continuity.
            </div>
            <div className="rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] p-3">
              <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-200" />
              Profile challenge signature is persisted as an operation receipt for reviewer traceability.
            </div>
          </div>
          {sessionLink ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-6 text-white/62">
              Session URL: {sessionLink}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

