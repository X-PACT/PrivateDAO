"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ROOT = process.cwd();
const VIDEO = path_1.default.resolve(ROOT, "docs/assets/private-dao-frontier-overview.mp4");
const POSTER = path_1.default.resolve(ROOT, "docs/assets/private-dao-frontier-overview-poster.png");
const PUBLIC_VIDEO = path_1.default.resolve(ROOT, "apps/web/public/assets/private-dao-frontier-overview.mp4");
const PUBLIC_POSTER = path_1.default.resolve(ROOT, "apps/web/public/assets/private-dao-frontier-overview-poster.png");
const DESKTOP_VIDEO = "/home/x-pact/Desktop/PrivateDAO-Frontier-Overview/PrivateDAO - Frontier Overview - Everything We Offer and Why Us.mp4";
function ffprobe(file) {
    const probe = (0, child_process_1.spawnSync)("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file], { encoding: "utf8" });
    if (probe.status !== 0) {
        throw new Error(`ffprobe failed for ${file}: ${probe.stderr || probe.stdout}`);
    }
    return JSON.parse(probe.stdout);
}
function main() {
    for (const file of [VIDEO, POSTER, PUBLIC_VIDEO, PUBLIC_POSTER, DESKTOP_VIDEO]) {
        if (!fs_1.default.existsSync(file)) {
            throw new Error(`Missing expected frontier video asset: ${file}`);
        }
    }
    const probe = ffprobe(VIDEO);
    const videoStream = (probe.streams || []).find((stream) => stream.codec_type === "video");
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720) {
        throw new Error("Frontier overview video is not 1280x720.");
    }
    const duration = Number(probe.format?.duration || 0);
    if (!(duration >= 45 && duration <= 55)) {
        throw new Error(`Frontier overview video duration is outside expected range: ${duration}`);
    }
    console.log("Frontier overview video verification: PASS");
}
main();
