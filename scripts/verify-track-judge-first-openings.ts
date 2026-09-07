import fs from "fs";
import path from "path";

import { getTrackReviewerPacketPublicLabel } from "../apps/web/src/lib/track-reviewer-packets";

type TrackJudgeFirstOpenings = {
  project: string;
  tracks: Array<{
    slug: string;
    bestDemoRoute: string;
    openingSequence: string[];
    voiceoverScript: string;
  }>;
};

function main() {
  const jsonPath = path.resolve("docs/track-judge-first-openings.generated.json");
  const mdPath = path.resolve("docs/track-judge-first-openings.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing track judge-first openings artifacts");
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as TrackJudgeFirstOpenings;
  const markdown = fs.readFileSync(mdPath, "utf8");

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
    `## ${getTrackReviewerPacketPublicLabel("colosseum-frontier")}`,
    `## ${getTrackReviewerPacketPublicLabel("privacy-track")}`,
    `## ${getTrackReviewerPacketPublicLabel("rpc-infrastructure")}`,
    "### First 30 To 45 Seconds",
    "### Voiceover Script",
  ]) {
    assert(markdown.includes(token), `track judge-first openings markdown is missing: ${token}`);
  }

  console.log("Track judge-first openings verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
