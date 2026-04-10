import { CommunityHub } from "@/components/community-hub";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ProductIntakeForms } from "@/components/product-intake-forms";
import { VideoCenter } from "@/components/video-center";
import { TrustSurface } from "@/components/trust-surface";

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
      title="Join the community, follow product momentum, and move into pilot or operator paths"
      description="Community is not a dead-end social page. It is the public entry for Discord, YouTube, product updates, pilot intent, support routing, and the shortest next step into PrivateDAO as a user, buyer, or operator."
      badges={[
        { label: "Discord live", variant: "success" },
        { label: "YouTube live", variant: "violet" },
        { label: "Join -> pilot -> operator", variant: "cyan" },
      ]}
    >
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
