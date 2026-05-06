"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const track_reviewer_packets_1 = require("../apps/web/src/lib/track-reviewer-packets");
function main() {
    const jsonPath = path_1.default.resolve("docs/track-judge-first-openings.generated.json");
    const mdPath = path_1.default.resolve("docs/track-judge-first-openings.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing track judge-first openings artifacts");
    }
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(payload.project === "PrivateDAO", "track judge-first openings project mismatch");
    assert(payload.tracks.length === 3, "track judge-first openings must cover 3 priority tracks");
    for (const slug of ["colosseum-frontier", "privacy-track", "rpc-infrastructure"]) {
        const track = payload.tracks.find((item) => item.slug === slug);
        assert(track, `missing track judge-first opening for ${slug}`);
        assert(track.openingSequence.length === 4, `${slug} opening sequence must have 4 steps`);
        assert(track.voiceoverScript.includes("What works now:"), `${slug} voiceover script missing what works now`);
        assert(track.voiceoverScript.includes("What is externally proven:"), `${slug} voiceover script missing proven section`);
        assert(track.voiceoverScript.includes("Exact blocker:"), `${slug} voiceover script missing blocker section`);
        assert(track.voiceoverScript.includes("Best demo route:"), `${slug} voiceover script missing demo route section`);
        assert(track.bestDemoRoute.startsWith("/"), `${slug} best demo route must be a route`);
    }
    for (const token of [
        "# Track Judge-First Openings",
        `## ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("colosseum-frontier")}`,
        `## ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("privacy-track")}`,
        `## ${(0, track_reviewer_packets_1.getTrackReviewerPacketPublicLabel)("rpc-infrastructure")}`,
        "### First 30 To 45 Seconds",
        "### Voiceover Script",
    ]) {
        assert(markdown.includes(token), `track judge-first openings markdown is missing: ${token}`);
    }
    console.log("Track judge-first openings verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
