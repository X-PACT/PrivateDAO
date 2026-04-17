import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Legacy Learning Alias",
  description:
    "Legacy route redirected to the main product learning surface so visitors land on the live PrivateDAO explanation first.",
  path: "/demo",
  keywords: ["private dao", "product story", "learn private dao", "devnet governance"],
  index: false,
});

export default function DemoAliasPage() {
  permanentRedirect("/learn");
}
