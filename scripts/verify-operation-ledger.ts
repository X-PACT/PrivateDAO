import fs from "fs";
import path from "path";

const LEDGER_JSON = path.resolve("docs/operation-ledger.generated.json");
const LEDGER_MD = path.resolve("docs/operation-ledger.generated.md");

type LedgerEntry = {
  id: string;
  lane: string;
  status: string;
  title: string;
  evidence: string[];
  verification: string[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function entryById(entries: LedgerEntry[], id: string) {
  const entry = entries.find((candidate) => candidate.id === id);
  assert(entry, `missing operation ledger entry: ${id}`);
  return entry;
}

function includesAny(values: string[], needle: string) {
  return values.some((value) => value.includes(needle));
}

function main() {
  assert(fs.existsSync(LEDGER_JSON), "missing docs/operation-ledger.generated.json");
  assert(fs.existsSync(LEDGER_MD), "missing docs/operation-ledger.generated.md");

  const ledger = JSON.parse(fs.readFileSync(LEDGER_JSON, "utf8"));
  const markdown = fs.readFileSync(LEDGER_MD, "utf8");
  const entries = ledger.entries as LedgerEntry[];

  assert(ledger.project === "PrivateDAO", "unexpected operation ledger project");
  assert(Array.isArray(entries) && entries.length >= 8, "operation ledger must contain the current evidence lanes");

  const handoff = entryById(entries, "dao-authority-handoff");
  assert(handoff.status === "pending-timelock", "current binary handoff must remain pending-timelock until execution");
  assert(handoff.title.includes("Anchor 1.0.1"), "current binary handoff title must mention Anchor 1.0.1");
  assert(includesAny(handoff.verification, "Squads proposal index: 3"), "missing current Squads proposal index 3");
  assert(includesAny(handoff.verification, "2026-05-27T02:25:39Z"), "missing current timelock release");
  assert(includesAny(handoff.verification, "TimeLockNotReleased / 6021"), "missing timelock enforcement boundary");
  assert(
    includesAny(handoff.verification, "HXcaUbT7Q8euufUbDKuhoRkSSYQPwUwmhw69TdePV6uY"),
    "missing current binary buffer",
  );

  const refhe = entryById(entries, "refhe-fhe-confidential-ops");
  assert(refhe.status === "verified", "REFHE/MagicBlock settlement gates must be recorded as verified");
  for (const required of [
    "3fygnmHzFpRQEbHq9q6u3djBnkTEcYz9y1TSwxDmbnuemshrMwLmy9CqpjifjRb7SmW3DbmXrkyq35cnjU7mMSPi",
    "5TmS2AcpAmifcoG97U63Unzy7wt7B2NfyhBRs8Z6C4r1eqcWthEqf3GLcZXQ33sVYHf9YwfvBNhZD8ZZdt4HRwEY",
    "4UiUumtuGeDciojDA26PkQby7RFiTNb12UG4ACcvGMGfQj24PUPxK5Apeno7EY8mbCvq8nR6h6nfxDcBpjPvGvPj",
    "22XW8XVhWwQtChNQK2aEqXv5BVBbckxUmu4NsisoZQW21KA5ii87gVNUTcNoZ9e1vYKnHmm62qP1girpzVXWN1WY",
    "2a8sHWgiVCZkstybMff2M9R6DVU4Y96Rfsg8mqYs7K3xcYSEG1zMcq2iSTNwLD6FgfXvxxxWpwEP9Tbyin47RXvE",
  ]) {
    assert(includesAny(refhe.verification, required), `missing REFHE/MagicBlock execution evidence: ${required}`);
    assert(markdown.includes(required), `operation ledger markdown missing ${required}`);
  }

  const ika = entryById(entries, "ika-2pcmpc-readiness");
  assert(ika.status === "code-ready", "IKA route must not be upgraded beyond code-ready without DKG/signature evidence");
  assert(
    includesAny(ika.verification, "No funded IKA dWallet DKG or final 2PC-MPC signature is claimed in this run"),
    "IKA readiness entry must preserve the execution boundary",
  );

  assert(
    markdown.includes("proposal index 3 execution") &&
      markdown.includes("funded IKA dWallet DKG") &&
      markdown.includes("mainnet REFHE/FHE production close"),
    "operation ledger markdown boundary is incomplete",
  );

  console.log("Operation ledger verification: PASS");
}

main();
