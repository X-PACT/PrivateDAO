import fs from "fs";
import path from "path";

const CANONICAL_PROGRAM_ID = "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx";

function main() {
  verifyAnchorToml();
  verifyProgramSource();
  verifyDocs();
  verifyFrontend();
  verifySupportingScripts();
  console.log("Program ID consistency verification: PASS");
}

function verifyAnchorToml() {
  const body = fs.readFileSync(path.resolve("Anchor.toml"), "utf8");
  const matches = [...body.matchAll(/private_dao = "([^"]+)"/g)].map((match) => match[1]);
  if (matches.length === 0) {
    throw new Error("Anchor.toml is missing private_dao program entries");
  }
  for (const entry of matches) {
    assert(entry === CANONICAL_PROGRAM_ID, `Anchor.toml contains unexpected private_dao id: ${entry}`);
  }
}

function verifyProgramSource() {
  const body = fs.readFileSync(path.resolve("programs/private-dao/src/lib.rs"), "utf8");
  const match = body.match(/declare_id!\("([^"]+)"\)/);
  assert(Boolean(match), "lib.rs is missing declare_id!");
  assert(match?.[1] === CANONICAL_PROGRAM_ID, `program source declare_id drifted: ${match?.[1] || "missing"}`);
}

function verifyDocs() {
  const checks: Array<[string, RegExp]> = [
    ["README.md", /Live devnet program: `([^`]+)`/],
    ["docs/live-proof.md", /Program ID: `([^`]+)`/],
    ["docs/devnet-release-manifest.md", /Program ID: `([^`]+)`/],
    ["docs/android-native.md", /program ID: `([^`]+)`/],
    ["docs/reviewer-fast-path.md", /Program ID: `([^`]+)`/],
    ["docs/pdao-token.md", /PrivateDAO governance program: `([^`]+)`/],
  ];

  for (const [file, pattern] of checks) {
    const body = fs.readFileSync(path.resolve(file), "utf8");
    const match = body.match(pattern);
    assert(Boolean(match), `${file} is missing its program-id anchor`);
    assert(match?.[1] === CANONICAL_PROGRAM_ID, `${file} drifted to a different program id: ${match?.[1] || "missing"}`);
  }
}

function verifyFrontend() {
  const body = fs.readFileSync(path.resolve("docs/index.html"), "utf8");
  const match = body.match(/const PROGRAM_ID = "([^"]+)";/);
  assert(Boolean(match), "docs/index.html is missing the PROGRAM_ID constant");
  assert(match?.[1] === CANONICAL_PROGRAM_ID, `frontend PROGRAM_ID drifted: ${match?.[1] || "missing"}`);
  assert(body.includes(CANONICAL_PROGRAM_ID), "frontend surface is missing the canonical program id");
}

function verifySupportingScripts() {
  const body = fs.readFileSync(path.resolve("scripts/generate-demo-reel.py"), "utf8");
  const match = body.match(/PROGRAM_ID = "([^"]+)"/);
  assert(Boolean(match), "generate-demo-reel.py is missing PROGRAM_ID");
  assert(match?.[1] === CANONICAL_PROGRAM_ID, `generate-demo-reel.py drifted: ${match?.[1] || "missing"}`);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
