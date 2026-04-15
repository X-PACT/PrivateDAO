import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  summary: {
    realDeviceStatus: string;
    monitoringStatus: string;
    settlementStatus: string;
    realDeviceCompletion: string;
    monitoringCompletion: string;
    settlementCompletion: string;
  };
  routes: string[];
  documents: string[];
  commands: string[];
};

function main() {
  const jsonPath = path.resolve("docs/execution-unlock-bundle.generated.json");
  const mdPath = path.resolve("docs/execution-unlock-bundle.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing execution unlock bundle artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "execution unlock bundle project mismatch");
  assert(evidence.routes.includes("/tracks/startup-accelerator"), "execution unlock bundle missing startup route");
  assert(evidence.routes.includes("/tracks/poland-grants"), "execution unlock bundle missing poland route");
  assert(evidence.documents.includes("docs/real-device-capture-closure-packet.md"), "execution unlock bundle missing real-device packet");
  assert(evidence.documents.includes("docs/monitoring-delivery.generated.md"), "execution unlock bundle missing monitoring evidence");
  assert(evidence.documents.includes("docs/settlement-receipt-closure.generated.md"), "execution unlock bundle missing settlement evidence");
  assert(evidence.commands.includes("npm run build:execution-unlock-bundle"), "execution unlock bundle missing build command");
  assert(evidence.commands.includes("npm run verify:execution-unlock-bundle"), "execution unlock bundle missing verify command");
  assert(markdown.includes("# Execution Unlock Bundle"), "execution unlock markdown missing title");

  console.log("Execution unlock bundle verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
