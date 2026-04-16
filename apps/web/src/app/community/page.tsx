import type { Metadata } from "next";
import Link from "next/link";

import { CommunityHub } from "@/components/community-hub";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ProductIntakeForms } from "@/components/product-intake-forms";
import { VideoCenter } from "@/components/video-center";
import { TrustSurface } from "@/components/trust-surface";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Community",
  description:
    "Community, support, and pilot entry route for the public-good governance and treasury infrastructure behind PrivateDAO.",
  path: "/community",
  keywords: ["community", "support", "pilot", "public good", "governance infrastructure"],
});

type CommunityPageProps = {
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

export default function CommunityPage({ searchParams }: CommunityPageProps) {
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
      eyebrow="Community"
      title="Join the community, follow product momentum, and step directly into pilot or operator paths"
      description="Community is the public entry for Discord, YouTube, product updates, pilot intent, support routing, and the shortest next step into PrivateDAO as a user, buyer, operator, or ecosystem supporter."
      badges={[
        { label: "Discord live", variant: "success" },
        { label: "YouTube live", variant: "violet" },
        { label: "Join -> support -> pilot", variant: "cyan" },
      ]}
    >
      <EcosystemFocusAlignmentStrip
        title="Community and education now grow directly from the live product"
        description="Hosted story, onboarding, trust, and pilot routes already give the community a practical way to support, understand, and extend PrivateDAO through real product use and production-oriented feedback."
      />
      <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.05] p-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">How the product is built</div>
        <div className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
          PrivateDAO is built as one coordinated engineering team across governance, payments, proof, infrastructure, education, and release work. The operating model is public because the product is open source and welcomes testing, review, and serious feedback from the ecosystem.
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/documents/engineering-delivery-model" className={cn(buttonVariants({ variant: "secondary" }), "justify-between")}>
            Open engineering delivery model
          </Link>
          <Link href="/learn" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open learning guide
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ variant: "outline" }), "justify-between")}>
            Open judge route
          </Link>
        </div>
      </div>
      <CommunityHub />
      <LeadSupportIntake mode="community" />
      <ProductIntakeForms mode="community" initialKind={initialKind} initialFundingContext={initialFundingContext} />
      <PlatformServiceArchitecture />
      <div className="hidden lg:block">
        <VideoCenter compact />
      </div>
      <TrustSurface />
    </OperationsShell>
  );
}
