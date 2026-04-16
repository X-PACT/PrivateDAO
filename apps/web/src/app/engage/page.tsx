import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Mail, MessageCircleMore, ShieldCheck } from "lucide-react";

import { CustomerConversionSurface } from "@/components/customer-conversion-surface";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ProductIntakeForms } from "@/components/product-intake-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreasuryReceiveSurface } from "@/components/treasury-receive-surface";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Engage",
  description:
    "Customer conversion route for pilots, hosted reads, confidential operations, enterprise governance, and explicit mainnet trajectory.",
  path: "/engage",
  keywords: ["engage", "pilot request", "hosted read api", "enterprise governance", "mainnet trajectory"],
  index: false,
});

type EngagePageProps = {
  searchParams?: { intake?: string; asset?: string; amount?: string; purpose?: string; lane?: string; profile?: string };
};

function normalizeIntake(value?: string, profile?: string) {
  if (value === "pilot" || value === "rpc" || value === "gaming" || value === "payments" || value === "support") {
    return value;
  }

  if (profile === "pilot-funding") {
    return "pilot";
  }

  if (profile === "treasury-top-up" || profile === "vendor-payout" || profile === "contributor-payout") {
    return "payments";
  }

  return undefined;
}

export default function EngagePage({ searchParams }: EngagePageProps) {
  const initialKind = normalizeIntake(searchParams?.intake, searchParams?.profile);
  const initialFundingContext = {
    asset: searchParams?.asset,
    amount: searchParams?.amount,
    purpose: searchParams?.purpose,
    lane: searchParams?.lane,
    profile: searchParams?.profile,
  };

  return (
    <OperationsShell
      eyebrow="Engage"
      title="Turn competition-grade demos into real customer and mainnet motion"
      description="This route connects every strong track corridor to an actual buyer story: what is sellable now on Devnet, what the first paid motion looks like, and how the rollout graduates toward mainnet without overstating readiness."
      badges={[
        { label: "Customer-ready", variant: "success" },
        { label: "Mainnet-aware", variant: "warning" },
        { label: "Track-linked", variant: "cyan" },
      ]}
    >
      <LeadSupportIntake mode="engage" />
      <ProductIntakeForms mode="engage" initialKind={initialKind} initialFundingContext={initialFundingContext} />
      <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury receive surface…</div>}>
        <TreasuryReceiveSurface />
      </Suspense>
      <Card>
        <CardHeader>
          <CardTitle>Leadership, investor, and donor contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-white/72">
            PrivateDAO is built with execution support from a multi-national technical team. <span className="text-white">Fahd Kotb</span> leads product direction, execution accountability, and external coordination across investment, partnerships, and operator-facing delivery.
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-emerald-200/76">
                <Mail className="h-3.5 w-3.5" />
                Use this contact surface for
              </div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
                <div>Investment discussions, donations, strategic help, enterprise pilots, integrations, and direct product-lead coordination.</div>
                <div>Primary email: <a className="text-white hover:text-cyan-200" href="mailto:fahd.kotb@tuta.io">fahd.kotb@tuta.io</a></div>
                <div>Operations email: <a className="text-white hover:text-cyan-200" href="mailto:i.kotb@proton.me">i.kotb@proton.me</a></div>
                <div>Additional contact: <a className="text-white hover:text-cyan-200" href="mailto:eslamkotb.369@gmail.com">eslamkotb.369@gmail.com</a></div>
                <div>WhatsApp: <a className="text-white hover:text-cyan-200" href="https://wa.me/201124030209" target="_blank" rel="noreferrer">+20 112 403 0209</a></div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/76">
                <MessageCircleMore className="h-3.5 w-3.5" />
                Direct channels
              </div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-white/68">
                <div>Telegram: <a className="text-white hover:text-cyan-200" href="https://t.me/Fahdkotb" target="_blank" rel="noreferrer">@Fahdkotb</a></div>
                <div>Discord: <a className="text-white hover:text-cyan-200" href="https://discord.gg/PbM8BC2A" target="_blank" rel="noreferrer">discord.gg/PbM8BC2A</a></div>
                <div>X: <a className="text-white hover:text-cyan-200" href="https://x.com/FahdX369" target="_blank" rel="noreferrer">@FahdX369</a></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/documents/ownership-and-contact" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
              Open leadership packet
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/documents/launch-trust-packet" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
              Open launch trust packet
              <ShieldCheck className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
      <CustomerConversionSurface />
      <PlatformServiceArchitecture />
    </OperationsShell>
  );
}
