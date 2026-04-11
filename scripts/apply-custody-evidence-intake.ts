import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const inputPath = path.resolve(process.argv[2] ?? "docs/custody-evidence-intake.json");
const targetPath = path.resolve("docs/multisig-setup-intake.json");

function run(command: string) {
  execSync(command, {
    stdio: "inherit",
    cwd: path.resolve(process.cwd()),
    shell: "/bin/bash",
  });
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`missing custody evidence intake input: ${path.relative(process.cwd(), inputPath)}`);
  }

  const original = fs.readFileSync(targetPath, "utf8");
  const candidate = fs.readFileSync(inputPath, "utf8");

  try {
    JSON.parse(candidate);
  } catch (error) {
    throw new Error(`invalid JSON in ${path.relative(process.cwd(), inputPath)}: ${(error as Error).message}`);
  }

  fs.writeFileSync(targetPath, candidate.endsWith("\n") ? candidate : `${candidate}\n`);

  try {
    run("npm run verify:multisig-intake");
    run("npm run record:custody-observed-readouts");
    run("npm run build:canonical-custody-proof");
    run("npm run verify:canonical-custody-proof");
    run("npm run build:launch-trust-packet");
    run("npm run verify:launch-trust-packet");
    run("npm run verify:generated-artifacts");
  } catch (error) {
    fs.writeFileSync(targetPath, original);
    throw new Error(
      `custody evidence apply failed; restored docs/multisig-setup-intake.json. ${(error as Error).message}`,
    );
  }

  console.log("Applied custody evidence intake and rebuilt canonical custody proof artifacts");
}

main();
