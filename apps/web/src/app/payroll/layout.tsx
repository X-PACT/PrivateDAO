import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Payroll",
  description:
    "PrivateDAO payroll route for CSV batch preview, USDC/PUSD/AUDD selection, Umbra/Cloak privacy posture, scoped viewing keys, and auditor-ready receipts.",
  path: "/payroll",
  keywords: ["private payroll", "Umbra", "Cloak", "USDC", "PUSD", "AUDD", "viewing keys"],
});

export default function PayrollLayout({ children }: { children: ReactNode }) {
  return children;
}
