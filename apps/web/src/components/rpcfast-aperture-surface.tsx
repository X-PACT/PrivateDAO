import { RadioTower, ShieldCheck, Zap } from "lucide-react";

import { getRpcFastInfrastructureSnapshot } from "@/lib/rpcfast-infrastructure";

export function RpcFastApertureSurface() {
  const snapshot = getRpcFastInfrastructureSnapshot();

  return (
    <section className="rounded-[34px] border border-orange-300/18 bg-gradient-to-br from-orange-300/[0.14] via-black/35 to-cyan-300/[0.08] p-6 shadow-2xl shadow-orange-950/20 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-orange-100">
            <Zap className="h-3.5 w-3.5" />
            RPCFast Aperture support
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
            Testnet execution now sits on a FastRPC-backed infrastructure lane.
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/68">
            PrivateDAO uses the Testnet RPC path for wallet-signed product execution, while Yellowstone, Aperture, and
            ShredStream are staged as backend-only streaming inputs for slot-lag telemetry, account observation, and
            release-candidate monitoring. Secrets stay server-side; the public product exposes health, not keys.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-white/68">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {snapshot.activatedPlan}
          </div>
          <div className="mt-2">Valid through {snapshot.validThrough}</div>
          <div className="mt-2 text-orange-100">
            {snapshot.configuredCount}/{snapshot.totalCount} endpoint groups configured in this environment
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {snapshot.endpoints.map((endpoint) => (
          <div key={endpoint.label} className="rounded-3xl border border-white/8 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <RadioTower className="h-4 w-4 text-cyan-300" />
                {endpoint.label}
              </div>
              <span
                className={
                  endpoint.configured
                    ? "rounded-full bg-emerald-300/12 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100"
                    : "rounded-full bg-white/8 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/42"
                }
              >
                {endpoint.configured ? "Configured" : "Pending"}
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/58">{endpoint.purpose}</p>
            <div className="mt-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-2 text-xs text-white/54">
              {endpoint.host}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
