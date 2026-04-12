import { getJudgeRuntimeLogsSnapshot, type JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

import { TelemetryRuntimeFocusClient } from "@/components/telemetry-runtime-focus-client";

type TelemetryRuntimeFocusStripProps = {
  context: "analytics" | "diagnostics" | "network";
};

export function TelemetryRuntimeFocusStrip({
  context,
}: TelemetryRuntimeFocusStripProps) {
  const snapshot: JudgeRuntimeLogsSnapshot = getJudgeRuntimeLogsSnapshot();

  return <TelemetryRuntimeFocusClient context={context} snapshot={snapshot} />;
}
