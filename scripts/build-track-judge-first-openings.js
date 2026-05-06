"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const site_data_1 = require("../apps/web/src/lib/site-data");
const track_judge_first_copy_1 = require("../apps/web/src/lib/track-judge-first-copy");
const track_proof_closure_1 = require("../apps/web/src/lib/track-proof-closure");
const track_reviewer_packets_1 = require("../apps/web/src/lib/track-reviewer-packets");
const OUTPUT_JSON = path_1.default.resolve("docs/track-judge-first-openings.generated.json");
const OUTPUT_MD = path_1.default.resolve("docs/track-judge-first-openings.generated.md");
function main() {
    const tracks = site_data_1.competitionTrackWorkspaces
        .filter((workspace) => track_proof_closure_1.TRACK_PROOF_PRIORITY_SLUGS.has(workspace.slug))
        .map((workspace) => {
        const copy = (0, track_judge_first_copy_1.getTrackJudgeFirstCopy)(workspace);
        return {
            slug: workspace.slug,
            title: (0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)(workspace.slug),
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
        purpose: "Canonical judge-first copy for track workspaces, reviewer packets, and the first 30 to 45 seconds of track videos.",
        tracks,
    };
    fs_1.default.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
    fs_1.default.writeFileSync(OUTPUT_MD, buildMarkdown(payload));
    console.log("Wrote track judge-first openings");
}
function buildMarkdown(payload) {
    const sections = payload.tracks
        .map((track) => [
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
    ].join("\n"))
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
