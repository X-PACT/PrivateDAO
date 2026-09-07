"use client";

import { useEffect, useState } from "react";
import { Database, FileCheck2, LockKeyhole, RefreshCw, Workflow } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const localEngineBaseUrl = (process.env.NEXT_PUBLIC_PRIVATE_ENGINE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");

type EngineOverview = {
  ok: boolean;
  engineVersion: string;
  license: { status: string; plan: string | null; organizationId: string | null; expiresAt: string | null; offlineGraceUntil: string | null; seatLimit: number; organizationLimit: number };
  workflows: { total: number; active: number };
  receipts: { total: number; verified: number };
  privacy: { privateInputsLeaveDeployment: boolean; witnessGeneratedInDeployment: boolean; groth16ProvedInDeployment: boolean; offlineSupported: boolean };
  events: Array<{ type: string; proofId?: string; workflowId?: string; createdAt: string }>;
};

export function PrivateEngineAdminDashboard() {
  const [overview, setOverview] = useState<EngineOverview | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`${localEngineBaseUrl}/v1/admin/overview`, { cache: "no-store" });
      const payload = (await response.json()) as EngineOverview;
      if (!response.ok || !payload.ok) throw new Error("Local engine is unavailable.");
      setOverview(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load local engine status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.055] p-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Private Engine Admin</div>
          <div className="mt-2 text-sm text-white/64">Operational status for this customer deployment. No private inputs are displayed here.</div>
        </div>
        <button type="button" onClick={load} disabled={loading} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-300/20 bg-red-400/[0.08] p-4 text-sm text-red-50/82">{error}</div> : null}

      {overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "License", value: overview.license.status, Icon: LockKeyhole },
              { label: "Workflows", value: `${overview.workflows.active}/${overview.workflows.total}`, Icon: Workflow },
              { label: "Receipts", value: `${overview.receipts.verified}/${overview.receipts.total} verified`, Icon: FileCheck2 },
              { label: "Engine", value: overview.engineVersion, Icon: Database },
            ].map(({ label, value, Icon }) => (
              <article key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Icon className="h-4 w-4 text-cyan-100" />
                <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/42">{label}</div>
                <div className="mt-2 text-lg font-semibold text-white">{value}</div>
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="text-sm font-semibold text-white">License posture</div>
              <div className="mt-4 grid gap-2 text-sm text-white/64">
                <div>Organization: <span className="text-white">{overview.license.organizationId || "Not bound"}</span></div>
                <div>Plan: <span className="text-white">{overview.license.plan || "Not available"}</span></div>
                <div>Expires: <span className="text-white">{overview.license.expiresAt || "Not available"}</span></div>
                <div>Seats: <span className="text-white">{overview.license.seatLimit || "Not configured"}</span></div>
              </div>
            </article>
            <article className="rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.05] p-5">
              <div className="text-sm font-semibold text-white">Privacy boundary</div>
              <div className="mt-4 grid gap-2 text-sm text-emerald-50/80">
                <div>Private inputs leave deployment: {overview.privacy.privateInputsLeaveDeployment ? "Yes" : "No"}</div>
                <div>Witness generated locally: {overview.privacy.witnessGeneratedInDeployment ? "Yes" : "No"}</div>
                <div>Groth16 proved locally: {overview.privacy.groth16ProvedInDeployment ? "Yes" : "No"}</div>
                <div>Offline mode: {overview.privacy.offlineSupported ? "Supported" : "Unavailable"}</div>
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="text-sm font-semibold text-white">Recent engine events</div>
            <div className="mt-4 grid gap-2">
              {overview.events.length ? overview.events.map((event, index) => (
                <div key={`${event.createdAt}-${index}`} className="grid gap-1 rounded-xl border border-white/10 bg-black/20 p-3 text-sm sm:grid-cols-[0.35fr_0.4fr_0.25fr] sm:items-center">
                  <span className="text-white">{event.type}</span>
                  <span className="font-mono text-xs text-white/54">{event.proofId || event.workflowId || "engine"}</span>
                  <span className="text-xs text-white/42">{event.createdAt}</span>
                </div>
              )) : <div className="text-sm text-white/50">No events recorded yet.</div>}
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
