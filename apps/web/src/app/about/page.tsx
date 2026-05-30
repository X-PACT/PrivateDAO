import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function AboutBridgePage() {
  return (
    <LegacyRouteRedirect
      title="About moved to the whiteprint"
      description="The shortest accurate description of PrivateDAO now lives in the whiteprint and judge path."
      target="/whiteprint"
      label="Open whiteprint"
    />
  );
}
