import Link from "next/link";
import { ArrowUpRight, Binary, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confidenceProfiles } from "@/lib/confidence-engine";
import { cn } from "@/lib/utils";
import { commandCenterPacks, executionLog, proposalCards } from "@/lib/site-data";

export function CommandCenter() {
  const featuredProposal = proposalCards[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Command Center</div>
              <CardTitle className="mt-2">One guided surface for create → submit → private vote → execute</CardTitle>
            </div>
            <StatusBadge status={featuredProposal.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Featured proposal</div>
            <div className="mt-2 text-xl font-medium text-white">{featuredProposal.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{featuredProposal.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <div className="text-sm font-medium text-white">Create proposal</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">Product packs, proposal cards, and buyer guidance reduce setup friction for normal users.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-4 w-4 text-fuchsia-300" />
                <div className="text-sm font-medium text-white">Private vote</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">Commit-reveal, optional ZK review rails, and evidence boundaries stay visible before any signing step.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <WalletCards className="h-4 w-4 text-cyan-300" />
                <div className="text-sm font-medium text-white">Execute treasury</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">Runtime evidence, settlement checks, and execution logs keep the treasury path understandable after approval.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="sm">Open governance dashboard</Button>
            <Button size="sm" variant="secondary">
              Open vote modal
            </Button>
            <Link href="/documents/reviewer-fast-path" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Review curated proof docs
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Command presets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {commandCenterPacks.map((pack) => (
            <div key={pack.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-medium text-white">{pack.title}</div>
                  <div className="mt-1 text-sm text-white/45">{pack.subtitle}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">{pack.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pack.technologies.map((technology) => (
                  <Badge key={technology} variant={technology.includes("ZK") ? "violet" : technology.includes("MagicBlock") ? "success" : "cyan"}>
                    {technology}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">{pack.readiness}</div>
            </div>
          ))}
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Execution log snapshot</div>
            <div className="mt-3 space-y-3">
              {executionLog.slice(0, 2).map((entry) => (
                <div key={entry.label}>
                  <div className="text-sm font-medium text-white">{entry.label}</div>
                  <div className="mt-1 text-sm leading-7 text-white/56">{entry.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <Binary className="h-4 w-4 text-cyan-300" />
              <div>
                <div className="text-sm font-medium text-white">Confidence engine snapshot</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                  ZK + REFHE + MagicBlock + Fast RPC
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {confidenceProfiles.map((profile) => (
                <div key={profile.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-white">{profile.title}</div>
                      <div className="mt-1 text-xs text-white/45">{profile.subtitle}</div>
                    </div>
                    <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-white">
                      {profile.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/documents/cryptographic-confidence-engine"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-4 w-full")}
            >
              Open engine specification
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
