import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Learning Redirect",
  description:
    "Legacy tracks route now redirects to the learning surface.",
  path: "/tracks",
  keywords: ["PrivateDAO learning route", "governance product", "devnet guide"],
  index: false
});

export default function TracksPage() {
  redirect("/learn");
}
