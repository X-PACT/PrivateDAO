export const incidentReadinessSections = [
  {
    title: "Monitor what fails first",
    summary:
      "A full web app needs operational visibility behind the UI. The fastest way to lose trust is letting RPC, wallet, or instruction failures become invisible until users complain.",
    bullets: [
      "Track RPC failures and sustained latency regression.",
      "Track wallet connection and signature failures.",
      "Track failed governance instructions by route and action.",
    ],
  },
  {
    title: "Alert on anomalies, not only outages",
    summary:
      "Repeated retries, duplicate execute attempts, and unexpected proposal-state transitions matter as much as hard downtime in a governance product.",
    bullets: [
      "Alert on repeated tx attempts or duplicate calls.",
      "Alert on proposal state inconsistencies and blocked transitions.",
      "Alert on treasury-action mismatches and execution anomalies.",
    ],
  },
  {
    title: "Keep a small response loop",
    summary:
      "Incident handling should stay deterministic: detect, classify, contain, verify state, collect evidence, and publish the operator update without improvisation.",
    bullets: [
      "Keep a short operator runbook.",
      "Preserve action-level logs for proposal and wallet flows.",
      "Use diagnostics and proof routes as part of the response surface.",
    ],
  },
] as const;

export const incidentReadinessLinks = [
  { label: "Diagnostics", href: "/diagnostics" },
  { label: "Proof center", href: "/proof" },
  { label: "Incident readiness runbook", href: "/documents/incident-readiness-runbook" },
] as const;
