"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const sourcePath = path_1.default.resolve("docs/zk/external-closure.json");
    const jsonPath = path_1.default.resolve("docs/zk/external-closure.generated.json");
    const mdPath = path_1.default.resolve("docs/zk/external-closure.generated.md");
    assert(fs_1.default.existsSync(sourcePath), "zk external closure source is missing");
    assert(fs_1.default.existsSync(jsonPath), "zk external closure json is missing");
    assert(fs_1.default.existsSync(mdPath), "zk external closure markdown is missing");
    const source = JSON.parse(fs_1.default.readFileSync(sourcePath, "utf8"));
    const generated = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
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
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
