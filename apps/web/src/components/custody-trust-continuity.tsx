"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Download, FileText, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

type CustodyTrustContinuityProps = {
  mode?: "documents" | "buyer";
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

export function CustodyTrustContinuity({ mode = "buyer" }: CustodyTrustContinuityProps) {
  const [evidence, setEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const syncEvidence = () => setEvidence(readCustodyEvidence());

    syncEvidence();
    window.addEventListener(custodyEvidenceUpdatedEvent, syncEvidence);
    window.addEventListener("storage", syncEvidence);
    window.addEventListener("focus", syncEvidence);
    window.addEventListener("pageshow", syncEvidence);

    return () => {
      window.removeEventListener(custodyEvidenceUpdatedEvent, syncEvidence);
      window.removeEventListener("storage", syncEvidence);
      window.removeEventListener("focus", syncEvidence);
      window.removeEventListener("pageshow", syncEvidence);
    };
  }, []);

  const completion = useMemo(() => getCustodyEvidenceCompletion(evidence), [evidence]);
  const narrative = useMemo(() => buildCustodyNarrative(evidence), [evidence]);

  const readmeCopy = useMemo(
    () =>
      [
        "README-aligned custody update",
        "",
        `Custody status: ${narrative.badge}`,
        `Custody completion: ${completion.completed}/${completion.total}`,
        "",
        "Summary:",
        narrative.summary,
        "",
        `Multisig address: ${evidence.multisigAddress.trim() || "Not recorded yet"}`,
        `Threshold: ${evidence.threshold.trim() || "Not recorded yet"}`,
        `Upgrade transfer signature: ${evidence.upgradeTransferSignature.trim() || "Not recorded yet"}`,
        `Treasury transfer signature: ${evidence.treasuryTransferSignature.trim() || "Not recorded yet"}`,
      ].join("\n"),
    [completion, evidence, narrative],
  );

  async function copyReadmePacket() {
    await navigator.clipboard.writeText(readmeCopy);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  const buyerSummary =
    completion.completed === 0
      ? "Buyer posture remains pilot-ready on Devnet, but production custody still needs recorded multisig and authority-transfer evidence."
      : completion.completed < completion.total
        ? "Buyer posture improves because custody evidence is starting to become inspectable, but mainnet promises should stay bounded until the remaining ceremony artifacts exist."
        : "Buyer posture is materially stronger because the custody packet is fully populated in-product, while final external validation still remains explicit.";

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>README packet copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-cyan-200">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-sm leading-7 text-white/58">
              Copy a concise custody update that stays aligned with the repo narrative and current trust boundary.
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
            Custody status is now evidence-aware inside the product. Use this packet when you need a README-style update without manually rewriting the trust state.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={copyReadmePacket}>{copyState === "copied" ? "Copied packet" : "Copy packet"}</Button>
            <Button variant="secondary" onClick={() => downloadPacket("privatedao-readme-custody-update.txt", readmeCopy)}>
              Download packet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Launch trust packet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-white">{narrative.headline}</div>
            </div>
            <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
              {narrative.badge}
            </Badge>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/58">
            {narrative.summary}
          </div>
          <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between")}>
            Open launch trust packet
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commercial buyer path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-amber-200">
              <WalletCards className="h-4 w-4" />
            </div>
            <div className="text-sm leading-7 text-white/58">
              {buyerSummary}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
            Current custody evidence completion: {completion.completed}/{completion.total}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/engage" className={cn(buttonVariants({ variant: mode === "buyer" ? "secondary" : "outline" }), "justify-between")}>
              Open buyer path
            </Link>
            <Link href="/custody" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
              Open custody workspace
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
