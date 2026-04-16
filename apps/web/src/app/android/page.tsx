import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Download, Github, ShieldCheck, Smartphone } from "lucide-react";

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
    "Download the current PrivateDAO Android devnet APK, review the parity plan, and follow the mobile branch as it expands toward deeper web-aligned service coverage.",
  path: "/android",
  keywords: ["android app", "apk", "mobile wallet adapter", "android governance app", "privatedao mobile"],
  index: false,
});

const parityItems = [
  "Create DAO, deposit treasury, create proposal, commit, reveal, finalize, and execute are already wired in Android.",
  "Authority-only cancel and veto now exist in the mobile product surface, not just the web surface.",
  "Reviewer, proof, monitoring, and incident continuity are exposed from inside the app while deeper native parity continues to expand.",
];

export default function AndroidPage() {
  return (
    <OperationsShell
      eyebrow="Android"
      title="Download the Android app and track the mobile parity path"
      description="PrivateDAO Android is being built as a first-class operating surface for the same governance product already served by the web app. This route gives reviewers, operators, and testers a direct APK download, the current branch guide, and the parity direction in one place."
      badges={[
        { label: "APK available", variant: "success" },
        { label: "Devnet-operable", variant: "cyan" },
        { label: "Web parity in progress", variant: "violet" },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Android download surface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-emerald-300/16 bg-emerald-300/[0.08] p-4 text-sm leading-7 text-white/72">
              The current downloadable APK is a branch-packaged devnet build for review, testing, and mobile governance walkthroughs. It is suitable for active product evaluation while release hardening continues.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-200/76">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </div>
                <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                  <div>Artifact: <span className="text-white">PrivateDAO Android devnet debug APK</span></div>
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
                  <div>Channel: <span className="text-white">Android-native devnet surface</span></div>
                  <div>Direction: <span className="text-white">broader service parity with web</span></div>
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
              Mobile is already usable for the core governance lifecycle on devnet. The remaining roadmap is focused on deeper native proof, monitoring, treasury previewing, and release hardening until the mobile surface reaches fuller operational alignment with the web app.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended review path</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">
              <Smartphone className="h-3.5 w-3.5" />
              1. Install
            </div>
            <div className="mt-3">Download the APK, install it on Android, and connect through a Mobile Wallet Adapter-compatible wallet.</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-violet-200/76">
              <CheckCircle2 className="h-3.5 w-3.5" />
              2. Operate
            </div>
            <div className="mt-3">Run DAO, proposal, voting, finalize, authority, and execution flows against the same devnet program used by the web app.</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-200/76">
              <ShieldCheck className="h-3.5 w-3.5" />
              3. Verify
            </div>
            <div className="mt-3">Follow explorer, proof, monitoring, and reviewer continuity from the app into the same trust surfaces already used on the web side.</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next delivery direction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-white/68">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            The next engineering steps are focused on AVD/device runtime proof, richer treasury execution previews, denser in-app reviewer evidence, and release hardening so the Android surface moves from strong devnet operations into a cleaner release-grade product lane.
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
