"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const site_data_1 = require("../apps/web/src/lib/site-data");
const track_judge_first_copy_1 = require("../apps/web/src/lib/track-judge-first-copy");
const track_mainnet_gates_1 = require("../apps/web/src/lib/track-mainnet-gates");
const track_proof_closure_1 = require("../apps/web/src/lib/track-proof-closure");
const track_reviewer_packets_1 = require("../apps/web/src/lib/track-reviewer-packets");
const technical_eligibility_1 = require("../apps/web/src/lib/technical-eligibility");
const OUTPUT_DIR = path_1.default.resolve("docs/track-reviewer-packets");
function main() {
    fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
    const tracks = site_data_1.competitionTrackWorkspaces.filter((workspace) => track_reviewer_packets_1.TRACK_REVIEWER_PACKET_SLUGS.has(workspace.slug));
    for (const workspace of tracks) {
        const judgeFirst = (0, track_judge_first_copy_1.getTrackJudgeFirstCopy)(workspace);
        const proofClosure = (0, track_proof_closure_1.getTrackSpecificProofContext)(workspace);
        const technicalFit = (0, technical_eligibility_1.getTrackTechnicalFit)(workspace.slug);
        const gates = (0, track_mainnet_gates_1.getTrackMainnetGatePlan)(workspace);
        const payload = {
            project: "PrivateDAO",
            generatedAt: new Date().toISOString(),
            track: {
                slug: workspace.slug,
                title: (0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)(workspace.slug),
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
            reviewerLinks: Array.from(new Map([
                { label: "Track workspace", href: `/tracks/${workspace.slug}` },
                { label: "Proof route", href: workspace.proofRoute },
                { label: "Judge route", href: workspace.judgeRoute },
                { label: "Story video", href: workspace.videoRoute },
                { label: "Reviewer telemetry packet", href: "/documents/reviewer-telemetry-packet" },
                { label: "Launch trust packet", href: "/documents/launch-trust-packet" },
                { label: "Canonical custody proof", href: "/documents/canonical-custody-proof" },
                { label: "Custody reviewer packet", href: "/documents/custody-proof-reviewer-packet" },
                ...technicalFit.evidenceRoutes,
            ].map((item) => [item.href, item])).values()),
            validationGates: technicalFit.validationGates,
            mainnetDiscipline: gates,
        };
        const jsonPath = path_1.default.resolve(`docs/track-reviewer-packets/${workspace.slug}.generated.json`);
        const mdPath = path_1.default.resolve((0, track_reviewer_packets_1.getTrackReviewerPacketDocumentPath)(workspace.slug));
        fs_1.default.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
        fs_1.default.writeFileSync(mdPath, buildMarkdown(payload));
    }
    console.log("Wrote track reviewer packets");
}
function buildMarkdown(payload) {
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
