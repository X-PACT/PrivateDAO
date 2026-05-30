import { LegacyRouteRedirect } from "@/components/legacy-route-redirect";

export default function PayrollBridgePage() {
  return (
    <LegacyRouteRedirect
      title="Payroll moved to encrypted payroll proof"
      description="Payroll is preserved as a route, but the current judging path is the REFHE payroll proof and confidential settlement lane."
      target="/services/refhe-payroll-proof"
      label="Open payroll proof"
    />
  );
}
