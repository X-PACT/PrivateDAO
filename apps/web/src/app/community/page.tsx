import { CommunityHub } from "@/components/community-hub";
import { LeadSupportIntake } from "@/components/lead-support-intake";
import { OperationsShell } from "@/components/operations-shell";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { ProductIntakeForms } from "@/components/product-intake-forms";
import { VideoCenter } from "@/components/video-center";
import { TrustSurface } from "@/components/trust-surface";

export default function CommunityPage() {
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
      <ProductIntakeForms mode="community" />
      <PlatformServiceArchitecture />
      <VideoCenter compact />
      <TrustSurface />
    </OperationsShell>
  );
}
