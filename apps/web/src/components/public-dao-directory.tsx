"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { entryFlowCopy } from "@/lib/entry-flow-copy";
import { buildPublicDaoDirectory, type PublicDaoDirectoryEntry, type PublicDaoProposalRecord } from "@/lib/public-dao-directory";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_PRIVATE_DAO_API_BASE || "https://api.privatedao.org";

export function PublicDaoDirectory() {
  const { locale } = useI18n();
  const copy = entryFlowCopy[locale];
  const [entries, setEntries] = useState<PublicDaoDirectoryEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadDirectory() {
      try {
        setStatus("loading");
        const response = await fetch(`${API_BASE}/api/v1/proposals`, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`DAO directory returned ${response.status}`);
        const payload = (await response.json()) as { proposals?: PublicDaoProposalRecord[] };
        if (cancelled) return;
        setEntries(buildPublicDaoDirectory(payload.proposals ?? []));
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setEntries([]);
        setStatus("error");
      }
    }

    void loadDirectory();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[22px] border border-cyan-300/16 bg-cyan-300/[0.06] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/72">{copy.publicDaos}</div>
          <div className="mt-2 text-sm leading-6 text-white/62">
            {copy.publicDaoHelper}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-xs text-white/58">
          {status === "loading" ? copy.loadingDaos : `${entries.length} ${copy.publicDaoCount}`}
        </div>
      </div>

      {status === "error" ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-300/18 bg-amber-300/[0.08] p-3 text-sm text-amber-100/80">
          <RefreshCw className="h-4 w-4" />
          Live DAO directory is temporarily unavailable. Creating a new DAO still works.
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {entries.slice(0, 8).map((entry) => (
            <div key={entry.daoAddress} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/24 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Activity className="h-3.5 w-3.5 text-emerald-100" />
                  <span className="truncate">{entry.daoName}</span>
                </div>
                <div className="mt-1 text-xs text-white/48">
                  {entry.activeProposalCount > 0 ? `${entry.activeProposalCount} active proposal` : "No active proposal"} · {entry.proposalCount} indexed proposals
                </div>
              </div>
              <Link
                href={`/govern?flow=join-dao&dao=${encodeURIComponent(entry.daoAddress)}&proposal=${encodeURIComponent(entry.latestProposalAddress)}&mint=${encodeURIComponent(entry.governanceMint)}&name=${encodeURIComponent(entry.daoName)}&title=${encodeURIComponent(entry.latestProposalTitle)}&authority=${encodeURIComponent(entry.authority ?? "")}#commit-vote-action`}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Open DAO
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
