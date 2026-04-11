import fs from "fs";
import path from "path";

const TRACKS = [
  {
    slug: "colosseum-frontier",
    heading: "# Colosseum Frontier Workspace Reviewer Packet",
    route: "/start",
  },
  {
    slug: "privacy-track",
    heading: "# Privacy Track Workspace Reviewer Packet",
    route: "/story",
  },
  {
    slug: "rpc-infrastructure",
    heading: "# RPC Infrastructure Credits Workspace Reviewer Packet",
    route: "/services",
  },
];

function main() {
  for (const track of TRACKS) {
    const jsonPath = path.resolve(`docs/track-reviewer-packets/${track.slug}.generated.json`);
    const mdPath = path.resolve(`docs/track-reviewer-packets/${track.slug}.generated.md`);

    if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
      throw new Error(`missing reviewer packet artifacts for ${track.slug}`);
    }

    const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
      project: string;
      track: { slug: string };
      judgeFirstOpening: { lines: string[]; voiceoverScript: string };
      exactBlocker: { id: string };
      bestDemoRoute: { route: string };
      reviewerLinks: Array<{ href: string }>;
    };
    const markdown = fs.readFileSync(mdPath, "utf8");

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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
