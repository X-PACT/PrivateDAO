"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const repoRoot = node_path_1.default.resolve(__dirname, "..");
const jsonPath = node_path_1.default.join(repoRoot, "docs", "ecosystem-focus-alignment.generated.json");
const mdPath = node_path_1.default.join(repoRoot, "docs", "ecosystem-focus-alignment.generated.md");
if (!node_fs_1.default.existsSync(jsonPath) || !node_fs_1.default.existsSync(mdPath)) {
    throw new Error("Missing ecosystem focus alignment generated artifacts");
}
const payload = JSON.parse(node_fs_1.default.readFileSync(jsonPath, "utf8"));
const markdown = node_fs_1.default.readFileSync(mdPath, "utf8");
if (!payload.generatedAt || !payload.title || !payload.summary) {
    throw new Error("Invalid ecosystem focus payload metadata");
}
if (payload.focusAreas.length < 7) {
    throw new Error("Expected at least 7 ecosystem focus areas");
}
for (const area of payload.focusAreas) {
    if (!area.slug || !area.title || !area.fit || area.bestRoutes.length === 0) {
        throw new Error(`Invalid ecosystem focus area: ${area.slug || area.title || "unknown"}`);
    }
    if (!markdown.includes(`## ${area.title}`)) {
        throw new Error(`Missing markdown section for ${area.title}`);
    }
}
console.log("ecosystem-focus-alignment: ok");
