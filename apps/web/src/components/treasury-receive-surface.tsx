"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Clipboard, Coins, Download, FileCheck2, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  buildServiceHandoffQuery,
  type ServiceHandoffAssetSymbol,
  writeStoredServiceHandoffState,
} from "@/lib/service-handoff-state";
import { getTreasuryReceiveConfig } from "@/lib/treasury-receive-config";
import { useServiceHandoffSnapshot } from "@/lib/use-service-handoff-snapshot";
import { cn } from "@/lib/utils";

const assetIconMap = {
  SOL: Wallet,
  USDC: Coins,
  USDG: Landmark,
} as const;

const handoffLanes = [
  {
    value: "buyer",
    label: "Buyer lane",
    summary: "Use for pilot funding, treasury top-ups, and commercial onboarding.",
    routes: [
      { label: "Engage", href: "/engage" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    value: "operator",
    label: "Operator lane",
    summary: "Use for infrastructure support, wallet operations, and RPC-backed treasury handling.",
    routes: [
      { label: "Command Center", href: "/command-center" },
      { label: "Diagnostics", href: "/diagnostics" },
    ],
  },
  {
    value: "support",
    label: "Support lane",
    summary: "Use when the sender needs help validating the right route, asset, or funding context first.",
    routes: [
      { label: "Assistant", href: "/assistant" },
      { label: "Community", href: "/community" },
    ],
  },
] as const;

const destinationProfiles = [
  {
    value: "treasury-top-up",
    label: "Treasury top-up",
    summary: "Route capital into the treasury for runway, governance execution, and shared operating capacity.",
    defaultLane: "buyer",
    defaultPurpose: "Treasury top-up for governance runway and shared Devnet operations.",
    intake: "payments",
    nextRoutes: [
      { label: "Services", href: "/services" },
      { label: "Command Center", href: "/command-center" },
    ],
  },
  {
    value: "pilot-funding",
    label: "Pilot funding",
    summary: "Fund a time-boxed pilot so the buyer path stays tied to a real product and measurable Devnet execution.",
    defaultLane: "buyer",
    defaultPurpose: "Pilot funding for PrivateDAO rollout, buyer onboarding, and measured Devnet validation.",
    intake: "pilot",
    nextRoutes: [
      { label: "Engage", href: "/engage" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    value: "vendor-payout",
    label: "Vendor payout",
    summary: "Prepare a governed payout for an external service provider with clear operational routing and evidence.",
    defaultLane: "operator",
    defaultPurpose: "Vendor payout request routed through governed treasury operations.",
    intake: "payments",
    nextRoutes: [
      { label: "Command Center", href: "/command-center" },
      { label: "Diagnostics", href: "/diagnostics" },
    ],
  },
  {
    value: "contributor-payout",
    label: "Contributor payout",
    summary: "Issue a governed payout for contributors, builders, or operators while preserving treasury discipline.",
    defaultLane: "operator",
    defaultPurpose: "Contributor payout request for governed treasury execution.",
    intake: "payments",
    nextRoutes: [
      { label: "Command Center", href: "/command-center" },
      { label: "Security", href: "/security" },
    ],
  },
] as const;

const treasuryReviewerLinks = [
  { label: "Canonical custody proof", href: "/documents/canonical-custody-proof" },
  { label: "Custody reviewer packet", href: "/documents/custody-proof-reviewer-packet" },
  { label: "Launch trust packet", href: "/documents/launch-trust-packet" },
  { label: "Mainnet blockers", href: "/documents/mainnet-blockers" },
] as const;

const treasurySendingChecklist = [
  "Confirm the destination profile before sending funds.",
  "Copy the exact public address for the chosen asset rail.",
  "Attach a reference string so the payment request can be matched to the treasury packet.",
  "Open the custody proof and launch trust packet if the sender needs reviewer-grade operating truth.",
] as const;

function buildSolanaExplorerHref(address: string, network: string) {
  const cluster = network.toLowerCase().includes("devnet") ? "?cluster=devnet" : "";
  return `https://solscan.io/account/${address}${cluster}`;
}

function resolveSupportedAsset(
  assets: Array<{ symbol: "SOL" | "USDC" | "USDG" }>,
  requestedAsset: ServiceHandoffAssetSymbol,
) {
  return assets.some((asset) => asset.symbol === requestedAsset)
    ? requestedAsset
    : "SOL";
}

export function TreasuryReceiveSurface() {
  const config = getTreasuryReceiveConfig();
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<(typeof config.assets)[number]["symbol"]>("SOL");
  const [profile, setProfile] = useState<(typeof destinationProfiles)[number]["value"]>("treasury-top-up");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [lane, setLane] = useState<(typeof handoffLanes)[number]["value"]>("buyer");
  const handoff = useServiceHandoffSnapshot("services");
  const appliedHandoffKeyRef = useRef<string | null>(null);
  const persistedPayloadSignatureRef = useRef<string | null>(null);

  const activeAsset = config.assets.find((asset) => asset.symbol === selectedAsset) ?? config.assets[0];
  const activeProfile = destinationProfiles.find((item) => item.value === profile) ?? destinationProfiles[0];
  const activeLane = handoffLanes.find((item) => item.value === lane) ?? handoffLanes[0];
  const handoffProfile = handoff?.payoutProfile ?? null;

  useEffect(() => {
    setLane(activeProfile.defaultLane);
    setPurpose(activeProfile.defaultPurpose);
  }, [activeProfile]);

  useEffect(() => {
    if (!handoff) return;

    const handoffKey = `${handoff.updatedAt}:${handoff.proposalId}:${handoff.payoutProfile}:${handoff.telemetryMode}`;
    if (appliedHandoffKeyRef.current === handoffKey) return;

    setProfile(handoff.payoutProfile);

    if (handoff.payoutIntent) {
      setSelectedAsset(resolveSupportedAsset(config.assets, handoff.payoutIntent.assetSymbol));
      setLane(handoff.payoutIntent.lane);
      setReference(handoff.payoutIntent.reference);
      setPurpose(handoff.payoutIntent.purpose);
      if (handoff.payoutIntent.amount) {
        setAmount(handoff.payoutIntent.amount);
      }
    }

    appliedHandoffKeyRef.current = handoffKey;
  }, [config.assets, handoff]);

  const requestPacket = useMemo(
    () =>
      [
        "PrivateDAO Treasury Request",
        `Destination profile: ${activeProfile.label}`,
        `Network: ${config.network}`,
        `Lane: ${activeLane.label}`,
        `Asset: ${activeAsset.symbol}`,
        `Reference: ${reference || "Not provided"}`,
        `Amount: ${amount || "Not provided"}`,
        `Purpose: ${purpose || "Not provided"}`,
        `Receive address: ${activeAsset.receiveAddress}`,
        `Mint: ${activeAsset.mint ?? "Configured at deployment through NEXT_PUBLIC_TREASURY_* env."}`,
        `Explorer: ${buildSolanaExplorerHref(activeAsset.receiveAddress, config.network)}`,
        "Recommended next routes:",
        ...activeProfile.nextRoutes.map((route) => `- ${route.label}: ${route.href}`),
      ].join("\n"),
    [activeAsset, activeLane.label, activeProfile, amount, config.network, purpose, reference],
  );
  const executionPayload = useMemo(
    () => ({
      proposalId: handoff?.proposalId ?? "services-treasury-intake",
      profile: activeProfile.value,
      profileLabel: activeProfile.label,
      lane,
      laneLabel: activeLane.label,
      assetSymbol: activeAsset.symbol,
      assetMint: activeAsset.mint ?? "env-configured",
      amount: amount || null,
      reference: reference || null,
      purpose: purpose || null,
      receiveAddress: activeAsset.receiveAddress,
      routeFocus: handoff?.payoutIntent?.routeFocus ?? activeProfile.summary,
      executionTarget: handoff?.payoutIntent?.executionTarget ?? `Treasury receive rail · ${activeAsset.symbol}`,
      telemetryMode: handoff?.telemetryMode ?? "packet",
    }),
    [activeAsset, activeLane.label, activeProfile, amount, handoff, lane, purpose, reference],
  );
  const persistedPayoutIntent = useMemo(() => {
    if (!handoff) return null;

    return {
      assetSymbol: activeAsset.symbol,
      amount,
      amountDisplay: amount ? `${amount} ${activeAsset.symbol}` : `${activeAsset.symbol} amount pending`,
      reference: reference || `${activeProfile.value.toUpperCase()}-REQUEST-PENDING`,
      purpose: purpose || activeProfile.defaultPurpose,
      lane,
      routeFocus: handoff.payoutIntent?.routeFocus ?? activeProfile.summary,
      recipient: activeAsset.receiveAddress,
      mintAddress: activeAsset.mint ?? null,
      executionTarget: handoff.payoutIntent?.executionTarget ?? `Treasury receive rail · ${activeAsset.symbol}`,
      evidenceRoute: handoff.payoutIntent?.evidenceRoute ?? "/documents/treasury-reviewer-packet",
    };
  }, [activeAsset, activeProfile, amount, handoff, lane, purpose, reference]);
  const persistedStateSignature = useMemo(
    () =>
      handoff && persistedPayoutIntent
        ? JSON.stringify({
            proposalId: handoff.proposalId,
            payoutProfile: activeProfile.value,
            telemetryMode: handoff.telemetryMode,
            payoutIntent: persistedPayoutIntent,
          })
        : null,
    [activeProfile.value, handoff, persistedPayoutIntent],
  );
  const continueHandoffQuery = useMemo(
    () =>
      handoff && persistedPayoutIntent
        ? buildServiceHandoffQuery({
            ...handoff,
            payoutProfile: activeProfile.value,
            payoutTitle: activeProfile.label,
            payoutIntent: persistedPayoutIntent,
          })
        : "",
    [activeProfile.label, activeProfile.value, handoff, persistedPayoutIntent],
  );
  const isRequestReady = Boolean(amount.trim() && purpose.trim() && reference.trim());

  useEffect(() => {
    if (!handoff || !persistedPayoutIntent || !persistedStateSignature) return;
    if (persistedPayloadSignatureRef.current === persistedStateSignature) return;

    writeStoredServiceHandoffState({
      ...handoff,
      payoutProfile: activeProfile.value,
      payoutTitle: activeProfile.label,
      updatedAt: new Date().toISOString(),
      source: "services",
      payoutIntent: persistedPayoutIntent,
    });
    persistedPayloadSignatureRef.current = persistedStateSignature;
  }, [activeProfile.label, activeProfile.value, handoff, persistedPayoutIntent, persistedStateSignature]);

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
  }

  function downloadRequest() {
    const blob = new Blob([requestPacket], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `privatedao-${activeAsset.symbol.toLowerCase()}-${lane}-request.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCopied("request-download");
  }

  function downloadStructuredRequest() {
    const blob = new Blob([JSON.stringify(structuredRequestObject, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `privatedao-${activeAsset.symbol.toLowerCase()}-${lane}-request.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCopied("structured-request-download");
  }

  const encodedPurpose = encodeURIComponent(purpose);
  const encodedAmount = encodeURIComponent(amount);
  const encodedProfile = encodeURIComponent(activeProfile.value);
  const engagePrimaryHref = `/engage?intake=${activeProfile.intake}&asset=${activeAsset.symbol}&amount=${encodedAmount}&purpose=${encodedPurpose}&lane=${lane}&profile=${encodedProfile}`;
  const structuredRequestObject = useMemo(
    () => ({
      kind: "privatedao.treasury.request",
      state: isRequestReady ? "ready-for-delivery" : "draft-pending-input",
      requestId: `${activeProfile.value}:${reference || "reference-pending"}`.toUpperCase(),
      preparedAt: new Date().toISOString(),
      proposalId: handoff?.proposalId ?? "services-treasury-intake",
      proposalTitle: handoff?.proposalTitle ?? activeProfile.label,
      network: config.network,
      payoutProfile: activeProfile.value,
      payoutTitle: activeProfile.label,
      lane,
      telemetryMode: handoff?.telemetryMode ?? "packet",
      asset: {
        symbol: activeAsset.symbol,
        mint: activeAsset.mint ?? "env-configured",
        receiveAddress: activeAsset.receiveAddress,
      },
      amount: amount || null,
      amountDisplay: amount ? `${amount} ${activeAsset.symbol}` : `${activeAsset.symbol} amount pending`,
      reference: reference || null,
      purpose: purpose || null,
      routeFocus: handoff?.payoutIntent?.routeFocus ?? activeProfile.summary,
      executionTarget: handoff?.payoutIntent?.executionTarget ?? `Treasury receive rail · ${activeAsset.symbol}`,
      evidenceRoute: handoff?.payoutIntent?.evidenceRoute ?? "/documents/treasury-reviewer-packet",
      requestRoute: continueHandoffQuery ? `/services?${continueHandoffQuery}#treasury-payment-request` : "/services#treasury-payment-request",
      deliveryRoute: continueHandoffQuery ? `/command-center?${continueHandoffQuery}#proposal-review-action` : "/command-center#proposal-review-action",
      telemetryRoute: continueHandoffQuery ? `/network?${continueHandoffQuery}` : "/network",
    }),
    [
      activeAsset.mint,
      activeAsset.receiveAddress,
      activeAsset.symbol,
      activeProfile.label,
      activeProfile.summary,
      activeProfile.value,
      amount,
      config.network,
      continueHandoffQuery,
      handoff?.payoutIntent?.evidenceRoute,
      handoff?.payoutIntent?.executionTarget,
      handoff?.payoutIntent?.routeFocus,
      handoff?.proposalId,
      handoff?.proposalTitle,
      handoff?.telemetryMode,
      isRequestReady,
      lane,
      purpose,
      reference,
    ],
  );

  return (
    <Card id="treasury-receive-surface">
      <CardHeader>
        <CardTitle>Treasury receive surface</CardTitle>
        <p className="mt-2 text-sm leading-7 text-white/60">
          Accept public treasury support and pilot funding through explicit Devnet rails. This surface exposes only public receive addresses and asset metadata.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Primary treasury route</div>
          <div className="mt-3 text-lg font-medium text-white">{config.network}</div>
          <div className="mt-3 break-all rounded-2xl border border-white/8 bg-black/20 p-4 font-mono text-sm leading-7 text-white/74">
            {config.treasuryAddress}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => copyValue("treasury", config.treasuryAddress)} className={cn(buttonVariants({ size: "sm" }))}>
              <Clipboard className="h-4 w-4" />
              Copy treasury address
            </button>
            <Link href={buildSolanaExplorerHref(config.treasuryAddress, config.network)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Open explorer
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/62">
              Accepted assets: SOL / USDC / USDG
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div id="treasury-payment-request" className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-200/78">
              <FileCheck2 className="h-4 w-4" />
              Treasury operating standard
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">
              This surface is intentionally public-address only. It supports treasury intake, reviewer truth, and buyer-safe payment routing without exposing signer material or hidden operator state.
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">What is public</div>
                <div className="mt-2">Receive addresses, mint references, routing context, and the reviewer-safe trust packet.</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">What stays private</div>
                <div className="mt-2">Signer keys, treasury seeds, multisig ceremony inputs, and any authority-transfer secrets remain outside the frontend.</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/58">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              Reviewer truth and payment discipline
            </div>
            <div className="mt-4 grid gap-3">
              {treasuryReviewerLinks.map((item) => (
                <Link key={item.href} href={item.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
                  {item.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Sender checklist</div>
              <div className="mt-3 grid gap-2 text-sm leading-7 text-white/62">
                {treasurySendingChecklist.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {config.assets.map((asset) => {
            const Icon = assetIconMap[asset.symbol];
            return (
              <div key={asset.symbol} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-emerald-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-lg font-medium text-white">{asset.symbol}</div>
                      <div className="mt-1 text-sm text-white/56">{asset.name}</div>
                    </div>
                  </div>
                  {copied === asset.symbol ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Receive address</div>
                  <div className="mt-2 break-all font-mono text-sm leading-7 text-white/74">{asset.receiveAddress}</div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Network</div>
                    <div className="mt-2">{asset.network}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Mint</div>
                    <div className="mt-2 break-all font-mono text-xs text-white/70">
                      {asset.mint ?? "Configured at deployment through NEXT_PUBLIC_TREASURY_* env."}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Use</div>
                    <div className="mt-2">{asset.note}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyValue(asset.symbol, asset.receiveAddress)}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4")}
                >
                  <Clipboard className="h-4 w-4" />
                  Copy {asset.symbol} route
                </button>
                <Link
                  href={buildSolanaExplorerHref(asset.receiveAddress, asset.network)}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3")}
                >
                  Open {asset.symbol} explorer
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-lg font-medium text-white">Treasury payment request</div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Pick the asset, amount, purpose, and handoff lane. The product returns a ready request packet tied to the correct public receive route.
            </p>
            {handoffProfile ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-300/[0.08] px-4 py-3 text-sm leading-7 text-white/72">
                Applied from service handoff: <span className="font-medium text-white">{activeProfile.label}</span>
                {handoff?.proposalId ? (
                  <span className="text-white/56"> · {handoff.proposalId}</span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Destination profile</span>
                <select
                  value={profile}
                  onChange={(event) => setProfile(event.target.value as typeof profile)}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none"
                >
                  {destinationProfiles.map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#0b1020]">
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs leading-6 text-white/46">{activeProfile.summary}</span>
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Asset</span>
                <select
                  value={selectedAsset}
                  onChange={(event) => setSelectedAsset(event.target.value as typeof selectedAsset)}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none"
                >
                  {config.assets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol} className="bg-[#0b1020]">
                      {asset.symbol} · {asset.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Reference</span>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="PILOT-APR-001 / OPS-REQUEST-042"
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
                />
                <span className="text-xs leading-6 text-white/46">Use a stable reference so treasury ops can match the sender, packet, and support lane without guesswork.</span>
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Amount</span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={`Amount in ${activeAsset.symbol}`}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Purpose</span>
                <textarea
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Treasury top-up, pilot funding, payout request, operator support..."
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/34"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/46">Handoff lane</span>
                <select
                  value={lane}
                  onChange={(event) => setLane(event.target.value as typeof lane)}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none"
                >
                  {handoffLanes.map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#0b1020]">
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/76">Structured treasury packet</div>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">{requestPacket}</pre>
            </div>

            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Execution payload continuity</div>
              <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-white/72">{JSON.stringify(executionPayload, null, 2)}</pre>
              {continueHandoffQuery ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/services?${continueHandoffQuery}#service-handoff`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    Refresh services continuity
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/command-center?${continueHandoffQuery}#proposal-review-action`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    Continue to command-center
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/network?${continueHandoffQuery}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    Continue to network
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/76">Delivery-ready request object</div>
              <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-white/72">{JSON.stringify(structuredRequestObject, null, 2)}</pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyValue("structured-request", JSON.stringify(structuredRequestObject, null, 2))}
                  className={cn(buttonVariants({ size: "sm" }), !isRequestReady && "pointer-events-none opacity-50")}
                  disabled={!isRequestReady}
                >
                  <Clipboard className="h-4 w-4" />
                  Copy request object
                </button>
                <button
                  type="button"
                  onClick={downloadStructuredRequest}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), !isRequestReady && "pointer-events-none opacity-50")}
                  disabled={!isRequestReady}
                >
                  <Download className="h-4 w-4" />
                  Download request JSON
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">Profile and lane summary</div>
              <div className="mt-3 text-base font-medium text-white">{activeProfile.label}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{activeProfile.summary}</p>
              <div className="mt-4 text-sm font-medium text-white">{activeLane.label}</div>
              <p className="mt-2 text-sm leading-7 text-white/60">{activeLane.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {activeProfile.nextRoutes.map((route) => (
                  <Link key={`${activeProfile.value}-${route.href}`} href={route.href} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {route.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
              {handoff?.payoutIntent ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/46">Handoff continuity</div>
                  <div className="mt-2">
                    {handoff.payoutIntent.routeFocus} · {handoff.payoutIntent.assetSymbol}
                    {handoff.payoutIntent.amount ? ` · ${handoff.payoutIntent.amount}` : " · sender amount still required"}
                  </div>
                  <div className="mt-2 text-white/54">
                    {handoff.payoutIntent.reference} · {handoff.payoutIntent.executionTarget}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copyValue("treasury-request", requestPacket)}
                disabled={!isRequestReady}
                className={cn(buttonVariants({ size: "sm" }), !isRequestReady && "pointer-events-none opacity-50")}
              >
                <Clipboard className="h-4 w-4" />
                Copy request packet
              </button>
              <button
                type="button"
                onClick={downloadRequest}
                disabled={!isRequestReady}
                className={cn(buttonVariants({ size: "sm", variant: "secondary" }), !isRequestReady && "pointer-events-none opacity-50")}
              >
                <Download className="h-4 w-4" />
                Download request
              </button>
              <Link
                href={engagePrimaryHref}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), !isRequestReady && "pointer-events-none opacity-50")}
                aria-disabled={!isRequestReady}
              >
                Continue to {activeProfile.intake === "pilot" ? "pilot" : "payments"} intake
                <ArrowRight className="h-4 w-4" />
              </Link>
              {continueHandoffQuery ? (
                <Link
                  href={`/command-center?${continueHandoffQuery}#proposal-review-action`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), !isRequestReady && "pointer-events-none opacity-50")}
                  aria-disabled={!isRequestReady}
                >
                  Continue to governed execution
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-5 text-sm leading-7 text-white/66">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-amber-200" />
            Secure configuration
          </div>
          <div className="mt-3">{config.securityNote}</div>
        </div>
      </CardContent>
    </Card>
  );
}
