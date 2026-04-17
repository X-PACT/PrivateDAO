import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Product Story Alias",
  description:
    "Legacy alias redirected into the main PrivateDAO learning corridor so visitors land on the live product explanation first.",
  path: "/demo",
  keywords: ["private dao", "product story", "learn private dao", "devnet governance"],
  index: false,
});

export default function DemoAliasPage() {
  permanentRedirect("/learn");
}
