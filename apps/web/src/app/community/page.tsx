import { CommunityHub } from "@/components/community-hub";
import { OperationsShell } from "@/components/operations-shell";

export default function CommunityPage() {
  return (
    <OperationsShell
      eyebrow="Community"
      title="PrivateDAO community channels, awards, and public momentum"
      description="Community should be a first-class route with the official YouTube channel, Discord entry, achievement visibility, and direct access to the competition center."
      badges={[
        { label: "YouTube live", variant: "success" },
        { label: "Discord-ready", variant: "violet" },
      ]}
    >
      <CommunityHub />
    </OperationsShell>
  );
}
