import Link from "next/link";
import { ArrowUpRight, KeyRound, LockKeyhole, Network, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const phaseTwoRails = [
  "Verify becomes the shared evidence path for records, claims, policy checks, and public receipts.",
  "The frozen Kernel provides the common lifecycle: invocation, policy, authorization, replay protection, proof, and evidence.",
  "Govern and Coordinate reuse the same commercial shell without exposing infrastructure details to customers.",
  "Every network integration stays behind capability ports, with support claims published only after real end-to-end tests.",
  "Solana remains the first certified execution and anchoring path; other networks are added by product need.",
  "The platform expands in controlled releases with rollback evidence, security review, and clear maturity labels.",
];

export function PhaseTwoSovereignRoadmap() {
  return (
    <section className="rounded-[28px] border border-amber-300/18 bg-amber-300/[0.07] p-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="warning">Commercial roadmap</Badge>
        <Badge variant="cyan">Kernel-bound platform</Badge>
        <Badge variant="violet">Network-neutral by design</Badge>
        <Badge variant="success">Evidence-led releases</Badge>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-100/78">
            <LockKeyhole className="h-4 w-4" />
            Product and platform roadmap
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            From one clear customer journey to a network-ready platform
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
            PrivateDAO first makes the customer journey simple: choose a product, complete a workflow, receive evidence,
            and share a result. Behind that experience, every product is bound to the frozen Kernel so authorization,
            policy evaluation, replay protection, proof, and evidence follow one controlled lifecycle.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/58">
            Sensitive inputs stay inside the approved privacy boundary. Product surfaces expose the outcome and the
            trust model; implementation details remain in the security and developer documentation.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/58">
            After local certification, the roadmap moves through controlled staging, provider conformance, and production
            readiness. Cross-network support is added per product and is labeled by evidence, never by a logo or an empty adapter.
          </p>
        </div>

        <div className="grid gap-3">
          {phaseTwoRails.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/68">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <KeyRound className="h-5 w-5 text-amber-100" />
          <div className="mt-3 text-sm font-medium text-white">Kernel foundation</div>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Shared product invocations, policies, identities, idempotency, and evidence are handled through one stable boundary.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <Network className="h-5 w-5 text-cyan-100" />
          <div className="mt-3 text-sm font-medium text-white">Network expansion</div>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Solana is the first verified path. EVM, Stellar, Bitcoin, Starknet, and Polkadot remain capability-led expansion tracks.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-100" />
          <div className="mt-3 text-sm font-medium text-white">Release confidence</div>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Each product advances from reconstructed to locally certified, then to production certification with explicit rollback evidence.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/products" className={cn(buttonVariants({ size: "sm" }))}>
          View the product map
        </Link>
        <Link href="/developers" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open developer surface
        </Link>
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          See Verify
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
