"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";
import { securityTracks } from "@/lib/site-data";

export function SecurityCenter() {
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
  const postureCopy = useMemo(() => {
    if (completion.completed === 0) {
      return {
        live: "Private governance, treasury execution, generated proof packets, V3 hardening proofs, reviewer bundle verification, and honest launch boundaries are already part of the repository surface.",
        explicit: "Mainnet custody, multisig ceremony, audit closure, and real-device runtime captures stay outside the claim boundary until they are evidenced and recorded.",
        why: "The security story remains additive because trust boundaries are stated plainly before custody evidence exists, rather than being blurred into marketing language.",
      };
    }

    if (completion.completed < completion.total) {
      return {
        live: "Private governance, treasury execution, generated proof packets, V3 hardening proofs, and partial custody ceremony evidence now sit together inside one product-facing security surface.",
        explicit: "The signer split and transfer path are becoming inspectable, but missing signatures or post-transfer readouts still keep mainnet custody outside the fully closed claim boundary.",
        why: "This matters because reviewers and buyers can see security maturity improving in real time without losing the explicit boundary around what is not yet closed.",
      };
    }

    return {
      live: "Private governance, treasury execution, generated proof packets, V3 hardening proofs, and fully recorded custody evidence are all visible together inside the live security surface.",
      explicit: "External validation and source-of-truth synchronization still remain separate disciplines, but custody readiness is no longer an undocumented gap inside the product story.",
      why: "This matters because security posture now reads as operationally disciplined and reviewable, not only architecturally ambitious.",
    };
  }, [completion.completed, completion.total]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Security architecture</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {securityTracks.map((track, index) => (
            <a
              key={track.title}
              href={track.href}
              rel="noreferrer"
              target="_blank"
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-fuchsia-300/25 hover:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-fuchsia-200">
                      {index < 2 ? <ShieldCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                    </div>
                    <div className="text-lg font-medium text-white">{track.title}</div>
                  </div>
                  <Badge variant={track.status === "Pending external" ? "warning" : track.status === "Integrated" ? "cyan" : "success"}>
                    {track.status}
                  </Badge>
                  <p className="text-sm leading-7 text-white/56">{track.summary}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-fuchsia-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Security posture</CardTitle>
            <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
              {narrative.badge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">What is live</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{postureCopy.live}</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">What stays explicit</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{postureCopy.explicit}</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-300/70">Why it matters</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{postureCopy.why}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
