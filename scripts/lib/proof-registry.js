"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProofRegistry = loadProofRegistry;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadProofRegistry() {
    const registryPath = path_1.default.resolve("docs/proof-registry.json");
    return JSON.parse(fs_1.default.readFileSync(registryPath, "utf8"));
}
