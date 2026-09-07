"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SPDX-License-Identifier: AGPL-3.0-or-later
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const json = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("docs/read-node/ops.generated.json"), "utf8"));
    const markdown = fs_1.default.readFileSync(path_1.default.resolve("docs/read-node/ops.generated.md"), "utf8");
    if (json.readPath !== "backend-indexer") {
        throw new Error("read-node ops snapshot path mismatch");
    }
    if (!json.runtime?.programId) {
        throw new Error("read-node ops snapshot missing runtime program id");
    }
    if (typeof json.overview?.refheConfigured !== "number") {
        throw new Error("read-node ops snapshot missing overview coverage");
    }
    const profile350 = Array.isArray(json.profiles) ? json.profiles.find((profile) => profile.name === "350") : null;
    if (!profile350 || profile350.waveCount !== 7) {
        throw new Error("read-node ops snapshot missing 350-wave profile");
    }
    if (!markdown.includes("# Read Node Ops Snapshot")) {
        throw new Error("read-node ops markdown heading mismatch");
    }
    if (!markdown.includes("REFHE configured")) {
        throw new Error("read-node ops markdown missing REFHE section");
    }
    if (!markdown.includes("read-node/same-domain-deploy.md")) {
        throw new Error("read-node ops markdown missing same-domain deploy guide");
    }
    console.log("Read-node ops snapshot verification: PASS");
}
main();
