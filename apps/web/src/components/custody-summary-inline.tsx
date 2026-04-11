"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buildCustodyNarrative, custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";

export function CustodySummaryInline() {
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

  return (
    <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">Custody summary</div>
            <div className="mt-1 text-base font-medium text-white">{narrative.headline}</div>
          </div>
        </div>
        <Badge variant={completion.completed === 0 ? "warning" : completion.completed < completion.total ? "cyan" : "success"}>
          {narrative.badge}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/58">{narrative.summary}</p>
      <div className="mt-4 text-sm leading-7 text-white/54">
        Evidence completion: {completion.completed}/{completion.total}
      </div>
    </div>
  );
}
