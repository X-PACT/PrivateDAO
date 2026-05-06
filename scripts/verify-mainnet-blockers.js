"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REQUIRED_IDS = [
    "external-audit-completion",
    "upgrade-authority-multisig",
    "production-monitoring-alerts",
    "real-device-wallet-runtime",
    "magicblock-refhe-source-receipts",
    "mainnet-cutover-ceremony",
];
const OPEN_STATUSES = new Set([
    "pending-external",
    "pending-runtime-captures",
    "pending-integration",
]);
function main() {
    const registerPath = path_1.default.resolve("docs/mainnet-blockers.json");
    const markdownPath = path_1.default.resolve("docs/mainnet-blockers.md");
    assertFile(registerPath);
    assertFile(markdownPath);
    const register = readJson(registerPath);
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    assert(register.schemaVersion === 1, "unexpected mainnet blocker schema version");
    assert(register.project === "PrivateDAO", "mainnet blocker register must be bound to PrivateDAO");
    assert(register.decision === "blocked-external-steps", "mainnet decision must remain explicit while blockers are open");
    assert(register.productionMainnetClaimAllowed === false, "production mainnet claim must be disabled while blockers are open");
    assert(register.summary.includes("real-funds mainnet"), "register summary must name the real-funds mainnet boundary");
    assert(Array.isArray(register.blockers) && register.blockers.length >= REQUIRED_IDS.length, "missing mainnet blockers");
    const ids = new Set();
    let openCount = 0;
    for (const blocker of register.blockers) {
        assertNonEmpty(blocker.id, "blocker id");
        assert(!ids.has(blocker.id), `duplicate blocker id: ${blocker.id}`);
        ids.add(blocker.id);
        assertNonEmpty(blocker.category, `${blocker.id} category`);
        assertNonEmpty(blocker.severity, `${blocker.id} severity`);
        assertNonEmpty(blocker.status, `${blocker.id} status`);
        assertNonEmpty(blocker.requiredBefore, `${blocker.id} requiredBefore`);
        assertNonEmpty(blocker.owner, `${blocker.id} owner`);
        assertNonEmpty(blocker.nextAction, `${blocker.id} nextAction`);
        assert(blocker.requiredBefore === "mainnet-real-funds", `${blocker.id} must block real-funds mainnet`);
        assert(blocker.evidence.length > 0, `${blocker.id} needs evidence pointers`);
        if (OPEN_STATUSES.has(blocker.status)) {
            openCount += 1;
        }
        if (blocker.status === "complete") {
            assert(Boolean(blocker.completionEvidence?.length), `${blocker.id} cannot be complete without completionEvidence`);
        }
        for (const evidencePath of blocker.evidence) {
            assertNonEmpty(evidencePath, `${blocker.id} evidence path`);
            if (evidencePath.startsWith("docs/") || evidencePath === "README.md") {
                assertFile(path_1.default.resolve(evidencePath));
            }
            assert(markdown.includes(blocker.id) && markdown.includes(evidencePath), `mainnet-blockers.md must reference ${blocker.id} and evidence path ${evidencePath}`);
        }
    }
    for (const id of REQUIRED_IDS) {
        assert(ids.has(id), `missing required blocker: ${id}`);
        assert(markdown.includes(id), `mainnet-blockers.md missing blocker: ${id}`);
    }
    assert(openCount > 0, "register should not silently claim mainnet production clearance");
    assert(markdown.includes("blocked-external-steps"), "mainnet-blockers.md must include the current decision");
    assert(markdown.includes("not cleared for real-funds mainnet production") ||
        (markdown.includes("Current claim boundary:") &&
            markdown.includes("advancing toward production release through the operating gates below")), "mainnet-blockers.md must include the honest production boundary");
    console.log(`Mainnet blocker register verification: PASS (${openCount} open blockers)`);
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
