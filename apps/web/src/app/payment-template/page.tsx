import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function PaymentTemplateBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Payment template moved to private settlement services"
      description="Payment and payroll templates now route through the confidential settlement and REFHE proof lanes."
      target="/services/refhe-payroll-proof"
      label="Open payroll proof"
    />
  );
}
