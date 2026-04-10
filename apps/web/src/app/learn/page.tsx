import { GettingStartedWorkspace } from "@/components/getting-started-workspace";
import { OperationsShell } from "@/components/operations-shell";
import { VideoCenter } from "@/components/video-center";

export default function LearnPage() {
  return (
    <OperationsShell
      eyebrow="Learn"
      title="Learn PrivateDAO through the shortest onboarding and product paths"
      description="This route packages onboarding, wallet-first entry, and the clearest first-run product steps for normal users and judges."
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Devnet live", variant: "success" },
        { label: "Search or ask AI", variant: "violet" },
      ]}
    >
      <GettingStartedWorkspace />
      <VideoCenter compact />
    </OperationsShell>
  );
}
