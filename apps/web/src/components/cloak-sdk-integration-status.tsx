import Link from "next/link";
import { ArrowUpRight, Code2, KeyRound, RadioTower, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const capabilityRows = [
  ["UTXO API", "Primary", "transact, createUtxo, createZeroUtxo, transfer, withdraw, and swap helpers are the active integration contract."],
  ["Viewing keys", "Ready", "The SDK path derives nk for scan/decrypt readiness, and the product boundary forbids logging private key material."],
  ["Relay / Merkle", "Live checked", "The repo probe checks Cloak devnet relay health and the executable devnet program account."],
  ["Compliance history", "Available", "Scanner and CSV exports are present in the SDK surface; full history requires a funded wallet and persisted UTXOs."],
  ["Read-node receipt", "Live", "The hosted PrivateDAO API returns a Cloak-labelled testnet intent receipt for reviewer-visible continuity."],
];

export function CloakSdkIntegrationStatus() {
  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.07] p-6">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/76">
        <ShieldCheck className="h-4 w-4" />
        Cloak SDK contract
      </div>
      <div className="mt-3 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h2 className="text-2xl font-semibold text-white">UTXO-first devnet lane, verified without exposing secrets</h2>
          <p className="mt-3 text-sm leading-7 text-white/68">
            This route now distinguishes the hosted PrivateDAO intent receipt from the official Cloak devnet SDK surface.
            Reviewers can see the exact SDK package, program, relay, and probe command used for live validation.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/44">
                <Code2 className="h-4 w-4 text-cyan-100/72" />
                SDK
              </div>
              <div className="mt-2 text-sm font-medium text-white">@cloak.dev/sdk-devnet</div>
              <div className="mt-1 text-xs leading-6 text-white/56">0.1.5-devnet.1 installed in the web app.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/44">
                <RadioTower className="h-4 w-4 text-cyan-100/72" />
                Devnet relay
              </div>
              <div className="mt-2 break-all text-sm font-medium text-white">https://api.devnet.cloak.ag</div>
              <div className="mt-1 text-xs leading-6 text-white/56">Checked by the generated live probe packet.</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-violet-300/16 bg-violet-300/[0.08] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-100/76">
              <KeyRound className="h-4 w-4" />
              Secret handling
            </div>
            <p className="mt-2 text-sm leading-7 text-white/68">
              The live probe records only public program IDs, public relay status, and public transaction or receipt
              references. It does not print private keys, viewing keys, UTXO private keys, raw notes, or seed material.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/44">Capability matrix</div>
          <div className="mt-4 space-y-3">
            {capabilityRows.map(([label, state, detail]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.09] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100/82">
                    {state}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-white/60">{detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/viewer/cloak-devnet-sdk-live-probe.generated/" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-between")}>
              Open SDK probe
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-between")}>
              Open proof lane
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
