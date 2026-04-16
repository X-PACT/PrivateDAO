"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

import { authorityHardeningLinks, authorityHardeningSections } from "@/lib/authority-hardening";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import { cn } from "@/lib/utils";

export function AuthorityHardeningPanel() {
  const [evidence, setEvidence] = useState<CustodyEvidence>(emptyCustodyEvidence);

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
  const dynamicSections = useMemo(
    () =>
      authorityHardeningSections.map((section) => {
        if (section.title === "Production ceremony") {
          return {
            ...section,
            summary:
              completion.completed === 0
                ? section.summary
                : completion.completed < completion.total
                  ? `Production ceremony evidence is partially recorded (${completion.completed}/${completion.total}). This is already stronger than a static plan, and the next step is to complete the remaining signatures and readouts.`
                  : "Production ceremony evidence is fully recorded inside the product surface. The remaining discipline is to keep the packet synchronized with the real source of truth and external validation trail.",
          };
        }

        if (section.title === "Launch boundary") {
          return {
            ...section,
            summary:
              completion.completed === 0
                ? section.summary
                : completion.completed < completion.total
                  ? "The launch path stays explicit, and it is now supported by partially inspectable custody evidence instead of a purely forward-looking note."
                  : "The launch path is now supported by a fully populated custody packet, which materially improves reviewability without collapsing the distinction between recorded evidence and final validation.",
          };
        }

        return section;
      }),
    [completion.completed, completion.total],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">Authority hardening</div>
            <CardTitle className="mt-2">Mainnet authority separation should be explicit, reviewable, and multisig-backed</CardTitle>
          </div>
          <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
            {narrative.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/64">
          {narrative.summary}
        </div>
        {dynamicSections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-cyan-200">
                {section.title === "Authority split" ? <KeyRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className="text-base font-medium text-white">{section.title}</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/60">{section.summary}</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
              {section.bullets.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>
          </div>
        ))}

        <div className="grid gap-3 sm:grid-cols-3">
          {authorityHardeningLinks.map((link) => (
            <Link key={link.href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
