import fs from "fs";
import path from "path";

import { competitionTrackWorkspaces } from "../apps/web/src/lib/site-data";
import { getTrackJudgeFirstCopy } from "../apps/web/src/lib/track-judge-first-copy";
import { getTrackMainnetGatePlan } from "../apps/web/src/lib/track-mainnet-gates";
import { getTrackSpecificProofContext } from "../apps/web/src/lib/track-proof-closure";
import {
  getTrackReviewerPacketDocumentPath,
  getTrackReviewerPacketPublicLabel,
  TRACK_REVIEWER_PACKET_SLUGS,
} from "../apps/web/src/lib/track-reviewer-packets";
import { getTrackTechnicalFit } from "../apps/web/src/lib/technical-eligibility";

const OUTPUT_DIR = path.resolve("docs/track-reviewer-packets");

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const tracks = competitionTrackWorkspaces.filter((workspace) =>
    TRACK_REVIEWER_PACKET_SLUGS.has(workspace.slug),
  );

  for (const workspace of tracks) {
    const judgeFirst = getTrackJudgeFirstCopy(workspace);
    const proofClosure = getTrackSpecificProofContext(workspace);
    const technicalFit = getTrackTechnicalFit(workspace.slug);
    const gates = getTrackMainnetGatePlan(workspace);

    const payload = {
      project: "PrivateDAO",
      generatedAt: new Date().toISOString(),
      track: {
        slug: workspace.slug,
        title: getTrackReviewerPacketPublicLabel(workspace.slug),
        sponsor: workspace.sponsor,
        objective: workspace.objective,
      },
      judgeFirstOpening: {
        lines: judgeFirst.openingSequence,
        voiceoverScript: judgeFirst.voiceoverScript,
      },
      proofClosure: {
        whatWorksNow: judgeFirst.whatWorksNow,
        externallyProven: judgeFirst.externallyProven,
        pendingSummary: proofClosure.pendingSummary,
      },
      exactBlocker: {
        id: judgeFirst.exactBlocker,
        summary: judgeFirst.exactBlockerSummary,
      },
      bestDemoRoute: {
        route: judgeFirst.bestDemoRoute,
        summary: judgeFirst.bestDemoSummary,
      },
      reviewerLinks: Array.from(
        new Map(
          [
            { label: "Track workspace", href: `/tracks/${workspace.slug}` },
            { label: "Proof route", href: workspace.proofRoute },
            { label: "Judge route", href: workspace.judgeRoute },
            { label: "Story video", href: workspace.videoRoute },
            { label: "Launch trust packet", href: "/documents/launch-trust-packet" },
            { label: "Canonical custody proof", href: "/documents/canonical-custody-proof" },
            { label: "Custody reviewer packet", href: "/documents/custody-proof-reviewer-packet" },
            ...technicalFit.evidenceRoutes,
          ].map((item) => [item.href, item]),
        ).values(),
      ),
      validationGates: technicalFit.validationGates,
      mainnetDiscipline: gates,
    };

    const jsonPath = path.resolve(`docs/track-reviewer-packets/${workspace.slug}.generated.json`);
    const mdPath = path.resolve(getTrackReviewerPacketDocumentPath(workspace.slug));

    fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
    fs.writeFileSync(mdPath, buildMarkdown(payload));
  }

  console.log("Wrote track reviewer packets");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  track: {
    slug: string;
    title: string;
    sponsor: string;
    objective: string;
  };
  judgeFirstOpening: {
    lines: string[];
    voiceoverScript: string;
  };
  proofClosure: {
    whatWorksNow: string[];
    externallyProven: Array<{ label: string; href: string; summary: string }>;
    pendingSummary: string;
  };
  exactBlocker: {
    id: string;
    summary: string;
  };
  bestDemoRoute: {
    route: string;
    summary: string;
  };
  reviewerLinks: Array<{ label: string; href: string }>;
  validationGates: string[];
  mainnetDiscipline: {
    beforeMainnet: string[];
    devnetOnly: string[];
    releaseDiscipline: string;
  };
}) {
  return `# ${payload.track.title} Reviewer Packet

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- track slug: \`${payload.track.slug}\`
- sponsor: \`${payload.track.sponsor}\`
- objective: ${payload.track.objective}

## Judge-First Opening

${payload.judgeFirstOpening.lines.map((line, index) => `${index + 1}. ${line}`).join("\n")}

Voiceover script:

${payload.judgeFirstOpening.voiceoverScript}

## Proof Closure

### What Works Now

${payload.proofClosure.whatWorksNow.map((line) => `- ${line}`).join("\n")}

### What Is Externally Proven

${payload.proofClosure.externallyProven.map((item) => `- ${item.label}: ${item.summary} (${item.href})`).join("\n")}

### What Is Still Pending

${payload.proofClosure.pendingSummary}

## Exact Blocker

- \`${payload.exactBlocker.id}\`
- ${payload.exactBlocker.summary}

## Best Demo Route

- route: \`${payload.bestDemoRoute.route}\`
- ${payload.bestDemoRoute.summary}

## Reviewer Links

${payload.reviewerLinks.map((item) => `- ${item.label}: ${item.href}`).join("\n")}

## Validation Gates

${payload.validationGates.map((item) => `- \`${item}\``).join("\n")}

## Mainnet Discipline

### Before Mainnet

${payload.mainnetDiscipline.beforeMainnet.map((item) => `- ${item}`).join("\n")}

### Devnet Only

${payload.mainnetDiscipline.devnetOnly.map((item) => `- ${item}`).join("\n")}

### Release Discipline

${payload.mainnetDiscipline.releaseDiscipline}
`;
}

main();
