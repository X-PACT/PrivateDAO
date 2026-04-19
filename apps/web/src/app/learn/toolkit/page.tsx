import type { Metadata } from "next";
import Link from "next/link";

import { LearnBootcampNav } from "@/components/learn-bootcamp-nav";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { learnToolkitItems } from "@/lib/learn-bootcamp";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "PrivateDAO Toolkit",
  description: "Starter kits for wallet-first UX, governance UI, runtime activity, and private payments inside PrivateDAO.",
  path: "/learn/toolkit",
  keywords: ["learn toolkit", "starter kit", "solana frontend", "private dao"],
});

export default function LearnToolkitPage() {
  return (
    <OperationsShell
      eyebrow="Toolkit"
      title="Plug-and-play starter kits built from the live product"
      description="These starter kits are not theoretical. Each one maps to a real PrivateDAO route, a real code surface in the repository, and a reusable GitHub template path."
      badges={[
        { label: "Live-route linked", variant: "cyan" },
        { label: "Code-linked", variant: "success" },
        { label: "Testnet-ready", variant: "violet" },
      ]}
    >
      <LearnBootcampNav />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/76">Starter template map</div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
          Use these as the bootcamp template set inside GitHub: <span className="font-semibold text-white">wallet-template</span>,
          <span className="font-semibold text-white"> governance-template</span>, <span className="font-semibold text-white">dao-ui-template</span>,
          <span className="font-semibold text-white"> runtime-template</span>, and <span className="font-semibold text-white">payment-template</span>.
          They now exist as live routes inside the site, stay linked to the source templates in GitHub, and hand the learner directly into the production Testnet corridors.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/services/privacy-sdk-api-starter" className={cn(buttonVariants({ size: "sm" }))}>
            Open privacy SDK / API starter
          </Link>
          <Link href="/products" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open product privacy policies
          </Link>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {learnToolkitItems.map((item) => (
          <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-xl font-semibold text-white">{item.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{item.summary}</p>
            <div className="mt-4 rounded-[20px] border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/68">
              Expected outcome: {item.expectedOutcome}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={item.sandboxRoute} className={cn(buttonVariants({ size: "sm" }))}>
                Open sandbox
              </Link>
              <Link href={item.liveRoute} className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open production route
              </Link>
              <Link href={item.verifyRoute} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open verification route
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {item.codeRefs.map((ref) => (
                <a
                  key={ref.href}
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62 transition hover:border-cyan-300/24 hover:bg-black/28"
                >
                  <div className="font-medium text-white">{ref.label}</div>
                  <div className="mt-1 break-all text-xs text-white/44">{ref.href}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
