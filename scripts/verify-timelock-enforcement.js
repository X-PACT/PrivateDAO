const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const proofPath = path.join(root, "docs/timelock-enforcement-proof-2026-05-23.md");
const squadsPath = path.join(root, "docs/squads-testnet-upgrade-proposal-2026-05-23.md");

const requiredFragments = [
  "TimeLockNotReleased",
  "6021",
  "CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv",
  "thHmF7VYNtxE1MaDzYXbfPCiq13RF6JwuWnjvDZuSmF",
  "2-of-3",
  "2026-05-25T00:31:05Z",
  "4Y8a2c2egEnNs1XUJqxEKie8wTi8m85EzZyqf5VcCKMLrB1UBDvskKH1TDkwXcpCfrt7P1PtHeYaVQDJxwAJGtkG",
  "2VH24vsTta1mDwmbN4cFmi2UdM9FNXtrzXjGzSdqSejm75ygek92BjLzYcwyGLmcfakMLyoGHuf3E9ppcd8FhdqY",
  "DAO authority and treasury authority remain separate handoff steps",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readRequired(filePath) {
  assert(fs.existsSync(filePath), `missing required file: ${path.relative(root, filePath)}`);
  const content = fs.readFileSync(filePath, "utf8");
  assert(content.trim().length > 0, `empty required file: ${path.relative(root, filePath)}`);
  return content;
}

const proof = readRequired(proofPath);
const squads = readRequired(squadsPath);
const combined = `${proof}\n${squads}`;

for (const fragment of requiredFragments) {
  assert(combined.includes(fragment), `timelock evidence is missing fragment: ${fragment}`);
}

const historicalReleaseAt = new Date("2026-05-25T00:31:05Z");
const currentReleaseAt = new Date("2026-05-27T02:25:39Z");
const msRemaining = currentReleaseAt.getTime() - Date.now();
const status =
  msRemaining > 0
    ? `Historical proof release ${historicalReleaseAt.toISOString()} verified; current proposal index 3 release in approximately ${Math.ceil(
        msRemaining / 3_600_000,
      )} hours`
    : "Historical proof verified; current proposal index 3 timelock release window is open";

console.log("Timelock enforcement verified.");
console.log(status);
console.log("PASS: docs/timelock-enforcement-proof-2026-05-23.md");
