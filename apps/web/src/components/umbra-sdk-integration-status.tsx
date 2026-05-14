import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const umbraLifecycle = [
  "received",
  "validating",
  "offsets_reserved",
  "building_tx",
  "tx_built",
  "submitting",
  "submitted",
  "awaiting_callback",
  "callback_received",
  "finalizing",
  "completed",
];

const supportedMints = [
  "So11111111111111111111111111111111111111112",
  "DXQwBNGgyQ2BzGWxEriJPVmXYFQBsQbXvfvfSNTaJkL6",
  "4oG4sjmopf5MzvTHLE8rpVJ2uyczxfsw2K84SUTpNDx7",
];

export function UmbraSdkIntegrationStatus() {
  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.07] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Umbra SDK runtime</div>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-semibold text-white">Devnet relayer, SDK contract, and claim lifecycle are exposed for review</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
            The live lane checks the Umbra devnet relayer through the PrivateDAO read-node and keeps the exact claim
            boundary visible: browser clients still need wallet signing, SDK-generated proof account data, UTXO slot
            data, and relayer polling before a real claim is submitted.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/viewer/umbra-devnet-sdk-live-probe.generated" className={cn(buttonVariants({ size: "sm" }))}>
              Open Umbra live probe
            </Link>
            <a href="https://api.privatedao.org/api/v1/umbra/relayer/info" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Read relayer info
            </a>
            <a href="https://api.privatedao.org/api/v1/umbra/relayer/health" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Check relayer health
            </a>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Verified public fields</div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-white/42">Relayer</dt>
              <dd className="mt-1 break-all font-mono text-xs text-white/72">https://relayer.api-devnet.umbraprivacy.com</dd>
            </div>
            <div>
              <dt className="text-white/42">Supported mints</dt>
              <dd className="mt-1 space-y-1">
                {supportedMints.map((mint) => (
                  <div key={mint} className="break-all font-mono text-xs text-white/68">
                    {mint}
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Claim lifecycle</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {umbraLifecycle.map((step) => (
            <span key={step} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/68">
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
