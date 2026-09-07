"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REQUIRED_ITEMS = [
    "create-production-multisig",
    "transfer-program-upgrade-authority",
    "configure-production-timelock",
    "backup-and-recovery-procedures",
    "monitoring-setup",
    "alerting-rules",
    "operator-runbooks",
    "emergency-procedures",
    "real-device-testing",
    "wallet-integration",
    "end-to-end-flows",
];
const ALLOWED_STATUSES = new Set([
    "pending-external",
    "pending-runtime-captures",
    "repo-documented",
    "repo-defined",
    "devnet-proven",
]);
function main() {
    const jsonPath = path_1.default.resolve("docs/launch-ops-checklist.json");
    const markdownPath = path_1.default.resolve("docs/launch-ops-checklist.md");
    assertFile(jsonPath);
    assertFile(markdownPath);
    const checklist = readJson(jsonPath);
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    assert(checklist.schemaVersion === 1, "unexpected launch ops schema version");
    assert(checklist.project === "PrivateDAO", "launch ops checklist must be bound to PrivateDAO");
    assert(checklist.decision === "blocked-external-steps", "launch ops decision must preserve the current mainnet boundary");
    assert(checklist.productionMainnetClaimAllowed === false, "production mainnet claim must remain disabled");
    assert(checklist.items.length >= REQUIRED_ITEMS.length, "missing launch ops items");
    const ids = new Set();
    for (const item of checklist.items) {
        assertNonEmpty(item.id, "item id");
        assert(!ids.has(item.id), `duplicate launch ops item: ${item.id}`);
        ids.add(item.id);
        assertNonEmpty(item.category, `${item.id} category`);
        assert(ALLOWED_STATUSES.has(item.status), `${item.id} has unsupported status: ${item.status}`);
        assert(item.requiredBefore === "mainnet-real-funds", `${item.id} must block real-funds mainnet`);
        assert(item.evidence.length > 0, `${item.id} needs evidence paths`);
        assert(markdown.includes(item.id), `launch-ops-checklist.md missing ${item.id}`);
        for (const evidencePath of item.evidence) {
            assertFile(path_1.default.resolve(evidencePath));
            assert(markdown.includes(evidencePath), `launch-ops-checklist.md missing evidence path ${evidencePath}`);
        }
    }
    for (const id of REQUIRED_ITEMS) {
        assert(ids.has(id), `missing required launch ops item: ${id}`);
    }
    assert(markdown.includes("Production mainnet claim allowed: `false`"), "launch ops markdown must preserve the no-production-claim boundary");
    console.log(`Launch ops checklist verification: PASS (${checklist.items.length} items)`);
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
