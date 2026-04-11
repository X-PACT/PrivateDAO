"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

type CustodyTrustContinuityProps = {
  mode?: "documents" | "buyer" | "track";
};

type CustodyWording = {
  packetTitle: string;
  packetDescription: string;
  packetNote: string;
  snippetTitle: string;
  snippetDescription: string;
  snippetNote: string;
  snippetLabel: string;
  buyerTitle: string;
};

function getCustodyWording(mode: NonNullable<CustodyTrustContinuityProps["mode"]>): CustodyWording {
  if (mode === "documents") {
    return {
      packetTitle: "Reviewer packet copy",
      packetDescription: "Copy a concise reviewer-facing custody update that stays aligned with the repo narrative and current trust boundary.",
      packetNote: "Use this packet when you need reviewer or audit-facing wording without manually rewriting the trust state.",
      snippetTitle: "Reviewer / deck snippet",
      snippetDescription: "Copy a trust-and-custody snippet that fits reviewer notes, audit summaries, or trust slides.",
      snippetNote: "This snippet stays aligned with the live product state and is intended for reviewer packets or trust sections.",
      snippetLabel: "Suggested reviewer copy:",
      buyerTitle: "Reviewer trust path",
    };
  }

  if (mode === "track") {
    return {
      packetTitle: "Judge packet copy",
      packetDescription: "Copy a concise judge-facing custody update that explains what is implemented, what is recorded, and what remains explicitly outside the claim boundary.",
      packetNote: "Use this packet when you need submission wording that strengthens trust without overstating mainnet readiness.",
      snippetTitle: "Judge / submission snippet",
      snippetDescription: "Copy a custody-and-trust snippet that fits the submission route, track workspace, or judge-facing notes.",
      snippetNote: "This snippet stays aligned with the live product state and is intended for submission trust, mainnet distance, or judge-facing sections.",
      snippetLabel: "Suggested submission copy:",
      buyerTitle: "Submission trust path",
    };
  }

  return {
    packetTitle: "README packet copy",
    packetDescription: "Copy a concise custody update that stays aligned with the repo narrative and current trust boundary.",
    packetNote: "Use this packet when you need a README-style update without manually rewriting the trust state.",
    snippetTitle: "Pitch deck snippet",
    snippetDescription: "Copy a concise custody-and-trust update that fits the investor or competition deck without rewriting the boundary language by hand.",
    snippetNote: "This snippet stays aligned with the live product state and is intended for the custody, trust, or mainnet-readiness slides.",
    snippetLabel: "Suggested slide copy:",
    buyerTitle: "Commercial buyer path",
  };
}

function getSnippetHeading(mode: NonNullable<CustodyTrustContinuityProps["mode"]>) {
  if (mode === "documents") return "Reviewer snippet - custody and trust";
  if (mode === "track") return "Judge submission snippet - custody and trust";
  return "Pitch deck snippet - custody and trust";
}

function getPacketHeading(mode: NonNullable<CustodyTrustContinuityProps["mode"]>) {
  if (mode === "documents") return "Reviewer-aligned custody update";
  if (mode === "track") return "Judge-aligned custody update";
  return "README-aligned custody update";
}

function getSuggestedCopy(
  mode: NonNullable<CustodyTrustContinuityProps["mode"]>,
  completed: number,
  total: number,
) {
  if (mode === "track") {
    if (completed === 0) {
      return "This submission already exposes the custody workflow inside the product, while production multisig and authority-transfer evidence remain explicit external launch gates rather than hidden assumptions.";
    }
    if (completed < total) {
      return `This submission now records partial custody ceremony evidence in-product (${completed}/${total}), which strengthens submission trust while keeping the remaining authority-transfer artifacts explicitly open.`;
    }
    return "This submission now keeps a fully populated custody packet inside the product surface, materially improving submission trust and shortening visible mainnet distance while preserving the explicit boundary around final external validation.";
  }

  if (mode === "documents") {
    if (completed === 0) {
      return "PrivateDAO already exposes the custody workflow inside the product, while production multisig and authority-transfer evidence remain explicit external launch gates for reviewer discipline.";
    }
    if (completed < total) {
      return `PrivateDAO now records partial custody ceremony evidence in-product (${completed}/${total}), which strengthens reviewer trust while keeping the remaining authority-transfer artifacts explicitly open.`;
    }
    return "PrivateDAO now keeps a fully populated custody packet inside the product surface, materially improving reviewer confidence while preserving the explicit boundary around final external validation.";
  }

  if (completed === 0) {
    return "PrivateDAO already exposes the custody workflow inside the product, while production multisig and authority-transfer evidence remain an explicit external launch gate.";
  }
  if (completed < total) {
    return `PrivateDAO now records partial custody ceremony evidence in-product (${completed}/${total}), which strengthens reviewer trust while keeping the remaining authority-transfer artifacts explicitly open.`;
  }
  return "PrivateDAO now keeps a fully populated custody packet inside the product surface, materially improving launch trust while preserving the explicit boundary around final external validation.";
}

function getBuyerSummary(
  mode: NonNullable<CustodyTrustContinuityProps["mode"]>,
  completed: number,
  total: number,
) {
  if (mode === "track") {
    if (completed === 0) {
      return "Submission trust remains strong on Devnet, but custody readiness still needs recorded multisig and authority-transfer evidence before mainnet distance can be described as materially shortened.";
    }
    if (completed < total) {
      return "Submission trust improves because custody evidence is becoming inspectable, but judge-facing mainnet claims should stay bounded until the remaining ceremony artifacts exist.";
    }
    return "Submission trust is materially stronger because the custody packet is fully populated in-product, while final external validation still remains explicit.";
  }

  if (mode === "documents") {
    if (completed === 0) {
      return "Reviewer posture remains evidence-aware, but production custody still needs recorded multisig and authority-transfer evidence.";
    }
    if (completed < total) {
      return "Reviewer posture improves because custody evidence is starting to become inspectable, but the remaining ceremony artifacts still need closure.";
    }
    return "Reviewer posture is materially stronger because the custody packet is fully populated in-product, while final external validation still remains explicit.";
  }

  if (completed === 0) {
    return "Buyer posture remains pilot-ready on Devnet, but production custody still needs recorded multisig and authority-transfer evidence.";
  }
  if (completed < total) {
    return "Buyer posture improves because custody evidence is starting to become inspectable, but mainnet promises should stay bounded until the remaining ceremony artifacts exist.";
  }
  return "Buyer posture is materially stronger because the custody packet is fully populated in-product, while final external validation still remains explicit.";
}

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
  const [pitchCopyState, setPitchCopyState] = useState<"idle" | "copied">("idle");

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
  const wording = useMemo(() => getCustodyWording(mode), [mode]);

  const readmeCopy = useMemo(
    () =>
      [
        getPacketHeading(mode),
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
    [completion, evidence, mode, narrative],
  );

  const pitchDeckSnippet = useMemo(
    () =>
      [
        getSnippetHeading(mode),
        "",
        `Custody status: ${narrative.badge}`,
        `Custody completion: ${completion.completed}/${completion.total}`,
        "",
        wording.snippetLabel,
        getSuggestedCopy(mode, completion.completed, completion.total),
        "",
        "Operator proof points:",
        `- Multisig address: ${evidence.multisigAddress.trim() || "Not recorded yet"}`,
        `- Threshold: ${evidence.threshold.trim() || "Not recorded yet"}`,
        `- Upgrade transfer signature: ${evidence.upgradeTransferSignature.trim() || "Not recorded yet"}`,
        `- Treasury transfer signature: ${evidence.treasuryTransferSignature.trim() || "Not recorded yet"}`,
        "",
        "Routes:",
        "- https://privatedao.org/custody/",
        "- https://privatedao.org/security/",
        "- https://privatedao.org/documents/launch-trust-packet/",
      ].join("\n"),
    [completion, evidence, mode, narrative, wording.snippetLabel],
  );

  async function copyReadmePacket() {
    await navigator.clipboard.writeText(readmeCopy);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  async function copyPitchPacket() {
    await navigator.clipboard.writeText(pitchDeckSnippet);
    setPitchCopyState("copied");
    window.setTimeout(() => setPitchCopyState("idle"), 1600);
  }

  const buyerSummary = useMemo(
    () => getBuyerSummary(mode, completion.completed, completion.total),
    [completion.completed, completion.total, mode],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>{wording.packetTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-cyan-200">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-sm leading-7 text-white/58">{wording.packetDescription}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
            Custody status is now evidence-aware inside the product. {wording.packetNote}
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
          <CardTitle>{wording.snippetTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-fuchsia-200">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-sm leading-7 text-white/58">{wording.snippetDescription}</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/60">
            {wording.snippetNote}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={copyPitchPacket}>{pitchCopyState === "copied" ? "Copied snippet" : "Copy snippet"}</Button>
            <Button variant="secondary" onClick={() => downloadPacket("privatedao-pitch-deck-custody-snippet.txt", pitchDeckSnippet)}>
              Download snippet
            </Button>
            <Link href="/viewer/investor-pitch-deck" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
              Open deck route
            </Link>
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
          <CardTitle>{wording.buyerTitle}</CardTitle>
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
