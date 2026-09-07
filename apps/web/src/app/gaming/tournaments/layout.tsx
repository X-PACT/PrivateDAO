import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Gaming Tournaments",
  description:
    "PrivateDAO tournaments route for guild prize pools, governed distribution proposals, private rewards, and proof-linked gaming DAO settlement.",
  path: "/gaming/tournaments",
  keywords: ["gaming tournaments", "guild rewards", "private rewards", "gaming DAO", "prize pool"],
});

export default function GamingTournamentsLayout({ children }: { children: ReactNode }) {
  return children;
}
