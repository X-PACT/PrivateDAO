"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { launchBlockers } from "@/lib/site-data";
import { custodyEvidenceUpdatedEvent, emptyCustodyEvidence, getCustodyEvidenceCompletion, readCustodyEvidence, type CustodyEvidence } from "@/lib/custody-evidence";

export function LaunchBlockersPanel() {
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
  const blockers = useMemo(
    () =>
      launchBlockers.map((blocker) => {
        if (blocker.name !== "Multisig + authority transfer") {
          return blocker;
        }

        if (completion.completed === 0) {
          return blocker;
        }

        if (completion.completed < completion.total) {
          return {
            ...blocker,
            state: "Tracked",
            note: `Custody evidence is partially recorded in-product (${completion.completed}/${completion.total}). Final external signatures and readouts are still required before closure.`,
          };
        }

        return {
          ...blocker,
          state: "Documented",
          note: "Custody evidence fields are fully populated in-product. Final external validation still needs to stay aligned with the recorded packet.",
        };
      }),
    [completion],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch blockers and readiness</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {blockers.map((blocker) => (
          <div key={blocker.name} className="rounded-3xl border border-white/8 bg-white/4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-white/85">
                  {blocker.state === "Documented" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
                </div>
                <div className="text-base font-medium text-white">{blocker.name}</div>
              </div>
              <Badge variant={blocker.state === "Documented" ? "success" : blocker.state === "Tracked" ? "cyan" : "warning"}>{blocker.state}</Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">{blocker.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
