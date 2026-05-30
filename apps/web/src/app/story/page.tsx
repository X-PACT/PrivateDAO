import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function StoryBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Story moved to the whiteprint"
      description="The project story is now anchored in the edited whiteprint and judge-ready narrative."
      target="/whiteprint"
      label="Open whiteprint"
    />
  );
}
