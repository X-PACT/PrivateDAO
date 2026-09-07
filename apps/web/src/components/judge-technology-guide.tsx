import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { JudgeTechnologyGuideClient } from "@/components/judge-technology-guide-client";

export function JudgeTechnologyGuide() {
  const snapshot = getJudgeRuntimeLogsSnapshot();
  return <JudgeTechnologyGuideClient snapshot={snapshot} />;
}
