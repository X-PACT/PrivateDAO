"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const inputPath = path_1.default.resolve(process.argv[2] ?? "docs/custody-evidence-intake.json");
const targetPath = path_1.default.resolve("docs/multisig-setup-intake.json");
function run(command) {
    (0, child_process_1.execSync)(command, {
        stdio: "inherit",
        cwd: path_1.default.resolve(process.cwd()),
        shell: "/bin/bash",
    });
}
function main() {
    if (!fs_1.default.existsSync(inputPath)) {
        throw new Error(`missing custody evidence intake input: ${path_1.default.relative(process.cwd(), inputPath)}`);
    }
    const original = fs_1.default.readFileSync(targetPath, "utf8");
    const candidate = fs_1.default.readFileSync(inputPath, "utf8");
    try {
        JSON.parse(candidate);
    }
    catch (error) {
        throw new Error(`invalid JSON in ${path_1.default.relative(process.cwd(), inputPath)}: ${error.message}`);
    }
    fs_1.default.writeFileSync(targetPath, candidate.endsWith("\n") ? candidate : `${candidate}\n`);
    try {
        run("npm run verify:multisig-intake");
        run("npm run record:custody-observed-readouts");
        run("npm run build:canonical-custody-proof");
        run("npm run verify:canonical-custody-proof");
        run("npm run build:custody-proof-reviewer-packet");
        run("npm run verify:custody-proof-reviewer-packet");
        run("npm run build:launch-trust-packet");
        run("npm run verify:launch-trust-packet");
        run("npm run verify:generated-artifacts");
    }
    catch (error) {
        fs_1.default.writeFileSync(targetPath, original);
        throw new Error(`custody evidence apply failed; restored docs/multisig-setup-intake.json. ${error.message}`);
    }
    console.log("Applied custody evidence intake and rebuilt canonical custody proof artifacts");
}
main();
