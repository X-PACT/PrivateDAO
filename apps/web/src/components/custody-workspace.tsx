"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Download, KeyRound, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authorityHardeningLinks, authorityHardeningSections } from "@/lib/authority-hardening";
import { emptyCustodyEvidence, readCustodyEvidence, writeCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

const custodySteps = [
  {
    title: "Define signer set",
    summary: "Freeze the production signer roster, role ownership, and threshold model before any authority movement.",
    state: "Repo-ready",
  },
  {
    title: "Create multisig",
    summary: "Create the production multisig and record the public address, threshold, and signer inventory.",
    state: "External execution pending",
  },
  {
    title: "Transfer upgrade authority",
    summary: "Move program upgrade authority into the multisig and preserve explorer-linked transaction evidence.",
    state: "External signature pending",
  },
  {
    title: "Transfer treasury authority",
    summary: "Move treasury operations and admin rails into the final authority split with explicit readouts.",
    state: "External signature pending",
  },
];

type EvidenceField = {
  label: string;
  value: string;
};

function downloadPacket(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function CustodyWorkspace() {
  const [draftEvidence, setDraftEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftEvidence(readCustodyEvidence());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeCustodyEvidence(draftEvidence);
  }, [draftEvidence]);

  function updateDraftEvidence<K extends keyof CustodyEvidence>(
    key: K,
    value: CustodyEvidence[K],
  ) {
    setDraftEvidence((current) => ({ ...current, [key]: value }));
  }

  const evidenceFields = useMemo<EvidenceField[]>(
    () => [
      { label: "Multisig public address", value: draftEvidence.multisigAddress.trim() || "Not recorded yet" },
      { label: "Threshold", value: draftEvidence.threshold.trim() || "Not recorded yet" },
      { label: "Signer roster", value: draftEvidence.signerRoster.trim() || "Not recorded yet" },
      { label: "Upgrade transfer signature", value: draftEvidence.upgradeTransferSignature.trim() || "Not recorded yet" },
      { label: "Treasury transfer signature", value: draftEvidence.treasuryTransferSignature.trim() || "Not recorded yet" },
      { label: "Post-transfer readouts", value: draftEvidence.postTransferReadouts.trim() || "Not recorded yet" },
    ],
    [draftEvidence],
  );

  const packet = useMemo(() => {
    const lines = [
      "PrivateDAO Custody Evidence Packet",
      "",
      "This packet records the current custody and authority-transfer evidence state.",
      "It does not claim mainnet custody completion until all external signatures and readouts are present.",
      "",
      ...evidenceFields.flatMap((field) => [`${field.label}:`, field.value, ""]),
      "Recommended source routes:",
      "https://privatedao.org/custody/",
      "https://privatedao.org/security/",
      "https://privatedao.org/diagnostics/",
      "https://privatedao.org/documents/production-custody-ceremony/",
      "https://privatedao.org/documents/authority-hardening-mainnet/",
      "https://privatedao.org/documents/authority-transfer-runbook/",
    ];

    return lines.join("\n");
  }, [evidenceFields]);

  async function copyPacket() {
    await navigator.clipboard.writeText(packet);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Operator draft capture</div>
              <CardTitle className="mt-2">Draft and export custody evidence without promoting it into canonical launch proof</CardTitle>
            </div>
            <Badge variant="warning">Evidence still required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-sm leading-7 text-white/60">
              The canonical launch truth now lives in the repo-backed proof surface above. This draft capture remains useful for operators preparing the ceremony packet, but it is intentionally not the official source of truth until the repo artifacts are updated with real values and explorer-linked evidence.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {custodySteps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{step.title}</div>
                  <Badge variant={step.state === "Repo-ready" ? "success" : "warning"}>{step.state}</Badge>
                </div>
                <div className="mt-3 text-sm leading-7 text-white/56">{step.summary}</div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-cyan-300/12 bg-cyan-300/5 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Draft evidence capture</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label id="multisig-address" className="space-y-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Multisig public address</div>
                <input
                  value={draftEvidence.multisigAddress}
                  onChange={(event) => updateDraftEvidence("multisigAddress", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Enter the production multisig public address"
                />
              </label>
              <label id="threshold" className="space-y-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Threshold</div>
                <input
                  value={draftEvidence.threshold}
                  onChange={(event) => updateDraftEvidence("threshold", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="2-of-3"
                />
              </label>
              <label id="signer-roster" className="space-y-2 lg:col-span-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Signer roster</div>
                <textarea
                  value={draftEvidence.signerRoster}
                  onChange={(event) => updateDraftEvidence("signerRoster", event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder={"Signer A - upgrade lead\nSigner B - treasury lead\nSigner C - recovery lead"}
                />
              </label>
              <label id="upgrade-transfer-signature" className="space-y-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Upgrade transfer signature</div>
                <input
                  value={draftEvidence.upgradeTransferSignature}
                  onChange={(event) => updateDraftEvidence("upgradeTransferSignature", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Explorer-linked signature"
                />
              </label>
              <label id="treasury-transfer-signature" className="space-y-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Treasury transfer signature</div>
                <input
                  value={draftEvidence.treasuryTransferSignature}
                  onChange={(event) => updateDraftEvidence("treasuryTransferSignature", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder="Explorer-linked signature"
                />
              </label>
              <label id="post-transfer-readouts" className="space-y-2 lg:col-span-2 scroll-mt-24">
                <div className="text-sm font-medium text-white">Post-transfer readouts</div>
                <textarea
                  value={draftEvidence.postTransferReadouts}
                  onChange={(event) => updateDraftEvidence("postTransferReadouts", event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
                  placeholder={"Program upgrade authority readout\nTreasury authority readout\nAdmin authority readout"}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {authorityHardeningSections.map((section, index) => (
              <div key={section.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-cyan-200">
                    {index === 0 ? <KeyRound className="h-4 w-4" /> : index === 1 ? <WalletCards className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div className="text-base font-medium text-white">{section.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{section.summary}</p>
                <div className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="text-sm leading-7 text-white/54">
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence packet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">What is true now</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              The custody workflow, signer split, and authority transfer runbooks are live and reviewable inside the product. The missing piece is the recorded transaction evidence from the real ceremony.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Current packet preview</div>
            <div className="mt-3 space-y-3">
              {evidenceFields.map((field) => (
                <div key={field.label}>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/36">{field.label}</div>
                  <div className="mt-1 break-words text-sm leading-7 text-white/58">{field.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <Button onClick={copyPacket} className="justify-between">
              {copyState === "copied" ? "Copied evidence packet" : "Copy evidence packet"}
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => downloadPacket("privatedao-custody-evidence.txt", packet)} className="justify-between">
              Download evidence packet
              <Download className="h-4 w-4" />
            </Button>
            {authorityHardeningLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                {link.label}
              </Link>
            ))}
            <Link href="/documents/multisig-setup-intake" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open multisig setup intake
            </Link>
            <Link href="/documents/authority-transfer-runbook" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open authority transfer runbook
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
