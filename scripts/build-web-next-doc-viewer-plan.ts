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
    rationale: "These documents already appear as proof and reviewer links in apps/web, but the full interactive docs-viewer behavior is not yet ported.",
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
    rationale: "These operator and launch artifacts belong in diagnostics and trust surfaces as direct links before a dedicated embedded viewer exists.",
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
    rationale: "The commercial journey already exists in apps/web and can continue using direct document links without recreating the docs viewer first.",
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
    rationale: "These are long-form technical references better served by a future document browser or MDX content layer.",
  },
  {
    tier: "current-docs-viewer-only",
    docs: [
      "?page=docs&doc=reviewer-fast-path.md",
      "?page=docs&doc=service-catalog.md",
      "?page=docs&doc=mainnet-blockers.md",
    ],
    nextSurface: "docs/index.html",
    strategy: "keep-in-docs-viewer",
    rationale: "Query-driven document-viewer entrypoints remain canonical in docs until apps/web gets explicit viewer parity.",
  },
];

function main() {
  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    status: "doc-viewer-parity-staged",
    currentCanonicalViewer: "docs/index.html?page=docs&doc=...",
    nextAppRoot: "apps/web",
    docClasses,
    nextStepPhases: [
      "phase 1: keep docs viewer canonical and link documents from apps/web surfaces",
      "phase 2: add a dedicated apps/web document route with curated proof, trust, and ops packets",
      "phase 3: decide whether long-form technical docs should move into MDX or remain raw-doc references",
    ],
    commands: [
      "npm run build:web-next-doc-viewer-plan",
      "npm run verify:web-next-doc-viewer-plan",
      "npm run build:web-next-query-strategy",
      "npm run verify:web-next-query-strategy",
    ],
    boundary: [
      "do not claim docs-viewer parity today",
      "keep ?page=docs&doc=... canonical until an explicit Next document route exists",
      "prefer reviewer-safe raw links over partial embedded viewer behavior",
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
