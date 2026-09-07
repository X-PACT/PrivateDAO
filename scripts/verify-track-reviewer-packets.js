"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const track_reviewer_packets_1 = require("../apps/web/src/lib/track-reviewer-packets");
const TRACKS = [
    {
        slug: "colosseum-frontier",
        heading: `# ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("colosseum-frontier")}`,
        route: "/start",
    },
    {
        slug: "privacy-track",
        heading: `# ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("privacy-track")}`,
        route: "/story",
    },
    {
        slug: "rpc-infrastructure",
        heading: `# ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("rpc-infrastructure")}`,
        route: "/services",
    },
];
function main() {
    for (const track of TRACKS) {
        const jsonPath = path_1.default.resolve(`docs/track-reviewer-packets/${track.slug}.generated.json`);
        const mdPath = path_1.default.resolve(`docs/track-reviewer-packets/${track.slug}.generated.md`);
        if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
            throw new Error(`missing reviewer packet artifacts for ${track.slug}`);
        }
        const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
        const markdown = fs_1.default.readFileSync(mdPath, "utf8");
        assert(payload.project === "PrivateDAO", `${track.slug} project mismatch`);
        assert(payload.track.slug === track.slug, `${track.slug} slug mismatch`);
        assert(payload.judgeFirstOpening.lines.length === 4, `${track.slug} judge-first opening must have 4 lines`);
        assert(payload.judgeFirstOpening.voiceoverScript.includes("What works now:"), `${track.slug} voiceover script missing what works now`);
        assert(payload.exactBlocker.id.length > 0, `${track.slug} exact blocker missing`);
        assert(payload.bestDemoRoute.route === track.route, `${track.slug} best demo route mismatch`);
        assert(payload.reviewerLinks.some((item) => item.href === "/documents/custody-proof-reviewer-packet"), `${track.slug} reviewer links missing custody reviewer packet`);
        for (const token of [
            track.heading,
            "## Judge-First Opening",
            "## Proof Closure",
            "## Exact Blocker",
            "## Best Demo Route",
            "## Reviewer Links",
            "## Validation Gates",
            "## Mainnet Discipline",
        ]) {
            assert(markdown.includes(token), `${track.slug} markdown missing ${token}`);
        }
    }
    console.log("Track reviewer packets verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
