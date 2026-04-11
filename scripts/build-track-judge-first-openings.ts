import fs from "fs";
import path from "path";

import { competitionTrackWorkspaces } from "../apps/web/src/lib/site-data";
import { getTrackJudgeFirstCopy } from "../apps/web/src/lib/track-judge-first-copy";
import { TRACK_PROOF_PRIORITY_SLUGS } from "../apps/web/src/lib/track-proof-closure";
import { getTrackReviewerPacketPublicLabel } from "../apps/web/src/lib/track-reviewer-packets";

const OUTPUT_JSON = path.resolve("docs/track-judge-first-openings.generated.json");
const OUTPUT_MD = path.resolve("docs/track-judge-first-openings.generated.md");

function main() {
  const tracks = competitionTrackWorkspaces
    .filter((workspace) => TRACK_PROOF_PRIORITY_SLUGS.has(workspace.slug))
    .map((workspace) => {
      const copy = getTrackJudgeFirstCopy(workspace);

      return {
        slug: workspace.slug,
        title: getTrackReviewerPacketPublicLabel(workspace.slug),
        sponsor: workspace.sponsor,
        liveRoute: workspace.liveRoute,
        proofRoute: workspace.proofRoute,
        videoRoute: workspace.videoRoute,
        whatWorksNow: copy.whatWorksNow,
        externallyProven: copy.externallyProven,
        exactBlocker: copy.exactBlocker,
        exactBlockerSummary: copy.exactBlockerSummary,
        bestDemoRoute: copy.bestDemoRoute,
        bestDemoSummary: copy.bestDemoSummary,
        openingSequence: copy.openingSequence,
        voiceoverScript: copy.voiceoverScript,
      };
    });

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    purpose:
      "Canonical judge-first copy for track workspaces, reviewer packets, and the first 30 to 45 seconds of track videos.",
    tracks,
  };

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(OUTPUT_MD, buildMarkdown(payload));

  console.log("Wrote track judge-first openings");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  purpose: string;
  tracks: Array<{
    slug: string;
    title: string;
    sponsor: string;
    liveRoute: string;
    proofRoute: string;
    videoRoute: string;
    whatWorksNow: string[];
    externallyProven: Array<{ label: string; href: string; summary: string }>;
    exactBlocker: string;
    exactBlockerSummary: string;
    bestDemoRoute: string;
    bestDemoSummary: string;
    openingSequence: string[];
    voiceoverScript: string;
  }>;
}) {
  const sections = payload.tracks
    .map((track) =>
      [
        `## ${track.title}`,
        "",
        `- slug: \`${track.slug}\``,
        `- sponsor: \`${track.sponsor}\``,
        `- best demo route: \`${track.bestDemoRoute}\``,
        `- proof route: \`${track.proofRoute}\``,
        `- video route: \`${track.videoRoute}\``,
        "",
        "### What Works Now",
        "",
        ...track.whatWorksNow.map((item) => `- ${item}`),
        "",
        "### What Is Externally Proven",
        "",
        ...track.externallyProven.map((item) => `- ${item.label}: ${item.summary} (${item.href})`),
        "",
        "### Exact Blocker",
        "",
        `- ${track.exactBlocker}: ${track.exactBlockerSummary}`,
        "",
        "### First 30 To 45 Seconds",
        "",
        ...track.openingSequence.map((line, index) => `${index + 1}. ${line}`),
        "",
        "### Voiceover Script",
        "",
        track.voiceoverScript,
      ].join("\n"),
    )
    .join("\n\n");

  return `# Track Judge-First Openings

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- purpose: ${payload.purpose}

${sections}
`;
}

main();
