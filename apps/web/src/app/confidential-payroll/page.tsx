import type { Metadata } from "next";

import PayrollPage from "@/app/payroll/page";
import { ProductSeo } from "@/components/product-seo";
import { buildRouteMetadata } from "@/lib/route-metadata";

const description = "Run payroll privately, apply approval policies, settle payments, and share proof without publishing employee details.";

export const metadata: Metadata = buildRouteMetadata({
  title: "Confidential Payroll",
  description,
  path: "/confidential-payroll",
  image: "/assets/social/payroll.png",
  keywords: ["confidential payroll software", "private payroll", "payroll verification", "payroll approvals"],
});

export default function ConfidentialPayrollPage() {
  return <ProductSeo name="Confidential Payroll" description={description} path="/confidential-payroll" category="BusinessApplication"><PayrollPage /></ProductSeo>;
}
