import { Badge } from "@/components/ui/badge";
import type { ProposalStatus } from "@/lib/site-data";

const variantMap: Record<ProposalStatus, "success" | "warning" | "cyan" | "violet"> = {
  "Live voting": "cyan",
  "Ready to reveal": "warning",
  Timelocked: "violet",
  "Execution ready": "success",
  "Evidence gated": "warning",
  Executed: "success",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
