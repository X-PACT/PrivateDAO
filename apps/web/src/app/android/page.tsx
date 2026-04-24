import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Download, Github, QrCode, ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  androidApkDownloadUrl,
  androidApkSha256,
  androidApkSizeLabel,
  androidBranchName,
  androidGuideUrl,
  androidRepositoryBaseUrl,
  androidReviewerRunbookUrl,
} from "@/lib/android-surface";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Android App",
  description:
    "Download the PrivateDAO Android APK and run wallet-first DAO governance, private execution lanes, and proof-linked on-chain verification from mobile.",
  path: "/android",
  keywords: ["android app", "apk", "mobile wallet adapter", "android governance app", "privatedao mobile"],
  index: false,
});

const parityItems = [
  "Create DAO, deposit treasury, create proposal, commit, reveal, finalize, execute, cancel, and veto are available from Android.",
  "Wallet-first mobile operations run on the same Solana Testnet program and verification path used by the web surface.",
  "Proof, runtime logs, monitoring, and reviewer routes stay linked so mobile execution remains auditable and easy to validate.",
];

const mobileFlowItems = [
  {
    title: "1. Connect",
    detail: "Open the Android app, connect a Mobile Wallet Adapter-compatible wallet, and keep the current account and Testnet network visible before any action starts.",
    icon: Wallet,
  },
  {
    title: "2. Review",
    detail: "Review the governance or execution intent first. The app should explain what will happen before the wallet prompt appears.",
    icon: Smartphone,
  },
  {
    title: "3. Sign",
    detail: "Approve the wallet action from the mobile wallet layer, then return to the app without losing the operation context.",
    icon: QrCode,
  },
  {
    title: "4. Verify",
    detail: "Open the same proof, explorer, and runtime continuity surfaces used by the web product so the mobile flow stays trustable end to end.",
    icon: ShieldCheck,
  },
];

export default function AndroidPage() {
  return (
    <OperationsShell
      eyebrow="Android"
      title="PrivateDAO Android: premium mobile DAO operations with privacy, proof, and wallet-first execution"
      description="This is a wallet-first Android operating surface for real Solana Testnet execution. Users can run serious DAO and treasury actions from mobile with privacy-preserving voting, encrypted operation lanes, and on-chain proof continuity, without terminal complexity."
      badges={[
        { label: "APK available", variant: "success" },
        { label: "Mobile-first execution", variant: "cyan" },
        { label: "Web + Android aligned", variant: "violet" },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Android download surface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/72">
              Android is a direct product surface for PrivateDAO operations: connect wallet, run governance lifecycle actions, and verify signatures and proof from mobile against Solana Testnet.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-200/76">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </div>
                <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                  <div>Artifact: <span className="text-white">PrivateDAO Android debug APK</span></div>
                  <div>Size: <span className="text-white">{androidApkSizeLabel}</span></div>
                  <div>SHA-256: <span className="break-all text-white">{androidApkSha256}</span></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-violet-200/76">
                  <Github className="h-3.5 w-3.5" />
                  Branch
                </div>
                <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                  <div>Working branch: <span className="text-white">{androidBranchName}</span></div>
                  <div>Channel: <span className="text-white">Android-native Testnet surface</span></div>
                  <div>Product scope: <span className="text-white">governance, treasury actions, proof-linked verification</span></div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={androidApkDownloadUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants(), "justify-between")}>
                Download Android APK
                <Download className="h-4 w-4" />
              </a>
              <a href={androidGuideUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
                Open Android guide
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={androidReviewerRunbookUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Open reviewer runbook
                <ShieldCheck className="h-4 w-4" />
              </a>
              <a href={androidRepositoryBaseUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
                Open Android branch
                <Github className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parity status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parityItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
                <div>{item}</div>
              </div>
            ))}
            <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/72">
              This Android surface is designed to feel like a category shift: complex DAO logic is reduced to guided wallet actions, while privacy, cryptographic guarantees, and on-chain verification stay visible to operators, partners, and reviewers.
            </div>
            <div className="rounded-3xl border border-amber-300/16 bg-amber-300/[0.08] p-4 text-sm leading-7 text-white/72">
              Android capture expansion for the full reveal, finalize, and execute evidence lane is <span className="text-white">actively scaling</span>. The product surface and build are live now with continuous runtime evidence expansion.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended mobile wallet flow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {mobileFlowItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
                  <Icon className="h-3.5 w-3.5" />
                  {item.title}
                </div>
                <div className="mt-3">{item.detail}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Android product positioning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-white/68">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            PrivateDAO Android is positioned as a category shift for DAO operations: privacy-preserving governance and treasury execution from mobile, with cryptographic trust and on-chain verification accessible to ordinary users.
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/proof" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open proof
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/documents/real-device-runtime" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
              Open runtime evidence
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/documents/monitoring-alert-rules" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
              Open monitoring rules
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </OperationsShell>
  );
}
