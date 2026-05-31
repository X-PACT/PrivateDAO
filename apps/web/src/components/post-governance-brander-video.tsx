import Link from "next/link";
import { ArrowUpRight, Clock3, ShieldCheck, UsersRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const proofFacts = [
  {
    label: "Program",
    value: "EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva",
    icon: ShieldCheck,
  },
  {
    label: "Multisig",
    value: "Squads v4, 2-of-3 threshold",
    icon: UsersRound,
  },
  {
    label: "Timelock",
    value: "48 hours before protected execution",
    icon: Clock3,
  },
] as const;

type PostGovernanceBranderVideoProps = {
  compact?: boolean;
};

export function PostGovernanceBranderVideo({ compact = false }: PostGovernanceBranderVideoProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(20,241,149,0.12),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(153,69,255,0.16),transparent_32%),rgba(3,8,20,0.94)] p-4 sm:p-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-center">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/72">Brand explainer</div>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            The simple story: governance passes, then PrivateDAO runs the work.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
            This short brand video is separate from the live demo. It explains why teams keep Telegram and Discord for
            conversation, then move review, approval, execution, and audit into a wallet-first Solana Testnet flow.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {proofFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="min-w-0 rounded-2xl border border-white/10 bg-black/22 p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/44">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-100/80" />
                    {fact.label}
                  </div>
                  <div className="mt-2 break-words text-sm font-semibold leading-6 text-white/82">{fact.value}</div>
                </div>
              );
            })}
          </div>

          {!compact ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/review?claim=metadao-grant-review-workflow#privacy-claim-console" className={cn(buttonVariants({ size: "sm" }))}>
                Run MetaDAO workflow
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open governance procedure
              </Link>
              <Link href="/documents/squads-testnet-custody-transfer-2026-05-22" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Verify multisig
              </Link>
              <Link href="/documents/timelock-enforcement-proof-2026-05-23" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Verify timelock
              </Link>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[24px] border border-white/10 bg-black/30 p-2 shadow-2xl shadow-black/30">
          <video
            className="aspect-video w-full rounded-[18px] bg-black object-cover"
            controls
            playsInline
            preload="metadata"
            poster="/assets/launch/private-dao-post-governance-brander-poster.png"
            src="/assets/launch/private-dao-post-governance-brander.mp4"
          />
        </div>
      </div>
    </section>
  );
}
