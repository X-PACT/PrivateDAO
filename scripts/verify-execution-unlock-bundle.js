"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/execution-unlock-bundle.generated.json");
    const mdPath = path_1.default.resolve("docs/execution-unlock-bundle.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing execution unlock bundle artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
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
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
main();
