import type { Metadata } from "next";

import CommandCenterPage from "@/app/command-center/page";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Govern",
  description:
    "Wallet-first governance flow for creating a DAO, submitting proposals, voting privately, and executing on Devnet.",
  path: "/govern",
  keywords: ["govern", "create dao", "vote", "execute", "devnet governance"],
});

export default CommandCenterPage;
