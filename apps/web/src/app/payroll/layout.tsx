import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Private Payroll",
  description:
    "Run payroll privately, apply tax and deduction policies, settle payments, and share a Blind Verification proof without exposing employee-level data.",
  path: "/payroll",
  keywords: ["confidential payroll", "payroll tax", "payroll verification", "private payments", "audit proof"],
});

export default function PayrollLayout({ children }: { children: ReactNode }) {
  return children;
}
