import fs from "fs";
import path from "path";

type DocClass = {
  tier: string;
  docs: string[];
  nextSurface: string;
  strategy: "keep-in-docs-viewer" | "surface-as-links" | "candidate-for-future-viewer";
  rationale: string;
};

const docClasses: DocClass[] = [
  {
    tier: "reviewer-core",
    docs: [
      "reviewer-fast-path.md",
      "reviewer-surface-map.md",
      "audit-packet.generated.md",
      "mainnet-readiness.generated.md",
      "test-wallet-live-proof-v3.generated.md",
    ],
    nextSurface: "/proof/",
    strategy: "surface-as-links",
    rationale: "These documents already appear as proof and reviewer links in apps/web, and key reviewer packets now have curated in-app routes.",
  },
  {
    tier: "ops-and-readiness",
    docs: [
      "mainnet-blockers.md",
      "launch-trust-packet.generated.md",
      "go-live-attestation.generated.json",
      "release-drill.generated.md",
      "launch-ops-checklist.md",
    ],
    nextSurface: "/diagnostics/",
    strategy: "surface-as-links",
    rationale: "These operator and launch artifacts belong in diagnostics and trust surfaces, with curated packets available directly in apps/web.",
  },
  {
    tier: "commercial-and-pilot",
    docs: [
      "service-catalog.md",
      "pilot-program.md",
      "pricing-model.md",
      "trust-package.md",
      "service-level-agreement.md",
    ],
    nextSurface: "/services/",
    strategy: "surface-as-links",
    rationale: "The commercial journey already exists in apps/web and now links into curated in-app documents for the highest-value commercial packets.",
  },
  {
    tier: "deep-reference",
    docs: [
      "zk-layer.md",
      "rpc-architecture.md",
      "backend-operator-flow.md",
      "zk-verifier-strategy.md",
      "read-node/indexer.md",
    ],
    nextSurface: "/security/",
    strategy: "candidate-for-future-viewer",
    rationale: "These are long-form technical references now supported by the generic /viewer/ route, while curated routes remain preferred for the highest-signal packets.",
  },
  {
    tier: "legacy-query-entrypoints",
    docs: [
      "?page=docs&doc=reviewer-fast-path.md",
      "?page=docs&doc=service-catalog.md",
      "?page=docs&doc=mainnet-blockers.md",
    ],
    nextSurface: "apps/web /documents + /viewer",
    strategy: "surface-as-links",
    rationale: "Legacy query entrypoints now have explicit Next routes, using curated documents when available and /viewer/ for broader markdown parity.",
  },
];

function main() {
  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    status: "doc-viewer-parity-live",
    currentCanonicalViewer: "apps/web /documents + /viewer",
    nextAppRoot: "apps/web",
    docClasses,
    nextStepPhases: [
      "phase 1: preserve high-signal reviewer and trust packets in curated /documents routes",
      "phase 2: preserve broader markdown parity through /viewer/[...slug]",
      "phase 3: decide whether the remaining long-form docs should move into MDX or stay repository-driven",
    ],
    commands: [
      "npm run build:web-next-doc-viewer-plan",
      "npm run verify:web-next-doc-viewer-plan",
      "npm run build:web-next-query-strategy",
      "npm run verify:web-next-query-strategy",
    ],
    boundary: [
      "apps/web document routes are now the canonical in-app viewer surface",
      "legacy docs queries now have Next destinations through curated /documents routes or the generic /viewer route",
      "raw repository files remain authoritative even when rendered in-app",
    ],
  };

  fs.writeFileSync(path.resolve("docs/web-next-doc-viewer-plan.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/web-next-doc-viewer-plan.generated.md"), buildMarkdown(payload));
  console.log("Wrote web next doc viewer parity plan");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  status: string;
  currentCanonicalViewer: string;
  nextAppRoot: string;
  docClasses: DocClass[];
  nextStepPhases: string[];
  commands: string[];
  boundary: string[];
}) {
  return `# Web Next Document Viewer Parity Plan

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- status: \`${payload.status}\`
- current canonical viewer: \`${payload.currentCanonicalViewer}\`
- next app root: \`${payload.nextAppRoot}\`

## Document Classes

${payload.docClasses
  .map(
    (entry) => `### ${entry.tier}

- next surface: \`${entry.nextSurface}\`
- strategy: \`${entry.strategy}\`
- rationale: ${entry.rationale}

Documents:

${entry.docs.map((doc) => `- \`${doc}\``).join("\n")}`,
  )
  .join("\n\n")}

## Next Step Phases

${payload.nextStepPhases.map((entry) => `- ${entry}`).join("\n")}

## Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Boundary

${payload.boundary.map((entry) => `- ${entry}`).join("\n")}
`;
}

main();
