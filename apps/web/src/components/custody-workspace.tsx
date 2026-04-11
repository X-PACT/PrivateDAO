import Link from "next/link";
import { KeyRound, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authorityHardeningLinks, authorityHardeningSections } from "@/lib/authority-hardening";
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

export function CustodyWorkspace() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Custody Workspace</div>
              <CardTitle className="mt-2">Multisig and authority transfer now have a live execution surface</CardTitle>
            </div>
            <Badge variant="warning">Evidence still required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-sm leading-7 text-white/60">
              PrivateDAO no longer treats custody as a hidden ops note. The workflow is now explicit: signer set, multisig creation, upgrade authority transfer, treasury authority transfer, and post-transfer readouts. What is still pending is the external signature evidence, not the operating plan.
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
          <CardTitle>Execution packet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/75">What is true now</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              The custody workflow, signer split, and authority transfer runbooks are live and reviewable inside the product. The missing piece is the recorded transaction evidence from the real ceremony.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Best next evidence</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/56">
              <div>Multisig public address and threshold</div>
              <div>Upgrade authority transfer signature</div>
              <div>Treasury authority transfer signature</div>
              <div>Post-transfer authority readouts</div>
            </div>
          </div>
          <div className="grid gap-3">
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
            <Button disabled className="justify-between">
              Record custody evidence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
