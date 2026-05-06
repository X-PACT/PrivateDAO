"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REQUIRED_RULES = [
    "rpc-slot-staleness",
    "blockhash-failure-spike",
    "unexpected-proposal-creation",
    "failed-finalize-spike",
    "strict-proof-failure",
    "settlement-evidence-failure",
    "treasury-balance-change",
    "upgrade-authority-activity",
];
function main() {
    const jsonPath = path_1.default.resolve("docs/monitoring-alert-rules.json");
    const markdownPath = path_1.default.resolve("docs/monitoring-alert-rules.md");
    assertFile(jsonPath);
    assertFile(markdownPath);
    const ruleset = readJson(jsonPath);
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    assert(ruleset.schemaVersion === 1, "unexpected monitoring alert rules schema version");
    assert(ruleset.project === "PrivateDAO", "alert rules must be bound to PrivateDAO");
    assert(ruleset.environment === "mainnet-candidate", "alert rules must target the mainnet candidate");
    assert(ruleset.claimBoundary.includes("pending external setup"), "alert rules must preserve the honest external setup boundary");
    assert(ruleset.rules.length >= REQUIRED_RULES.length, "missing alert rules");
    const ids = new Set();
    for (const rule of ruleset.rules) {
        assertNonEmpty(rule.id, "rule id");
        assert(!ids.has(rule.id), `duplicate alert rule id: ${rule.id}`);
        ids.add(rule.id);
        assertNonEmpty(rule.category, `${rule.id} category`);
        assertNonEmpty(rule.severity, `${rule.id} severity`);
        assertNonEmpty(rule.signal, `${rule.id} signal`);
        assertNonEmpty(rule.condition, `${rule.id} condition`);
        assertNonEmpty(rule.action, `${rule.id} action`);
        assertNonEmpty(rule.runbook, `${rule.id} runbook`);
        assert(rule.status === "defined", `${rule.id} must be explicitly defined`);
        assertFile(path_1.default.resolve(rule.runbook));
        assert(markdown.includes(rule.id), `monitoring-alert-rules.md missing ${rule.id}`);
    }
    for (const id of REQUIRED_RULES) {
        assert(ids.has(id), `missing required alert rule: ${id}`);
    }
    assert(markdown.includes("live delivery still requires external monitoring setup"), "monitoring markdown must preserve external setup boundary");
    console.log(`Monitoring alert rule verification: PASS (${ruleset.rules.length} rules)`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function assertFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`missing required file: ${path_1.default.relative(process.cwd(), filePath)}`);
    }
}
function assertNonEmpty(value, label) {
    assert(typeof value === "string" && value.trim().length > 0, `missing ${label}`);
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
