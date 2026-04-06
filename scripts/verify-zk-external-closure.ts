import fs from "fs";
import path from "path";

function main() {
  const sourcePath = path.resolve("docs/zk-external-closure.json");
  const jsonPath = path.resolve("docs/zk-external-closure.generated.json");
  const mdPath = path.resolve("docs/zk-external-closure.generated.md");

  assert(fs.existsSync(sourcePath), "zk external closure source is missing");
  assert(fs.existsSync(jsonPath), "zk external closure json is missing");
  assert(fs.existsSync(mdPath), "zk external closure markdown is missing");

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as {
    stages: Array<{ id: string; label: string; status: string; owner: string; blocking: boolean }>;
  };
  const generated = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
    stages: Array<{ id: string; label: string; status: string; owner: string; blocking: boolean }>;
    requiredDocs: string[];
    commands: string[];
  };
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(Array.isArray(source.stages) && source.stages.length >= 3, "zk external closure must track at least three stages");
  assert(generated.stages.length === source.stages.length, "generated zk external closure stage count mismatch");
  assert(generated.requiredDocs.includes("docs/zk-external-audit-scope.md"), "zk external closure missing audit scope doc");
  assert(generated.requiredDocs.includes("docs/canonical-verifier-boundary-decision.md"), "zk external closure missing verifier boundary decision doc");
  assert(generated.commands.includes("npm run build:zk-external-closure"), "zk external closure missing build command");
  assert(generated.commands.includes("npm run verify:zk-external-closure"), "zk external closure missing verify command");
  assert(generated.commands.includes("npm run capture:zk-enforced-runtime -- <target> --template-only"), "zk external closure missing capture helper command");
  assert(markdown.includes("ZK External Closure Package"), "zk external closure markdown title mismatch");

  console.log("ZK external closure verification: PASS");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
