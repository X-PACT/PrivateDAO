import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const VIDEO = path.resolve(ROOT, "docs/assets/private-dao-frontier-overview.mp4");
const POSTER = path.resolve(ROOT, "docs/assets/private-dao-frontier-overview-poster.png");
const PUBLIC_VIDEO = path.resolve(ROOT, "apps/web/public/assets/private-dao-frontier-overview.mp4");
const PUBLIC_POSTER = path.resolve(ROOT, "apps/web/public/assets/private-dao-frontier-overview-poster.png");
const DESKTOP_VIDEO =
  "/home/x-pact/Desktop/PrivateDAO-Frontier-Overview/PrivateDAO - Frontier Overview - Everything We Offer and Why Us.mp4";

function ffprobe(file: string) {
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file],
    { encoding: "utf8" }
  );
  if (probe.status !== 0) {
    throw new Error(`ffprobe failed for ${file}: ${probe.stderr || probe.stdout}`);
  }
  return JSON.parse(probe.stdout);
}

function main() {
  for (const file of [VIDEO, POSTER, PUBLIC_VIDEO, PUBLIC_POSTER, DESKTOP_VIDEO]) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing expected frontier video asset: ${file}`);
    }
  }

  const probe = ffprobe(VIDEO);
  const videoStream = (probe.streams || []).find((stream: any) => stream.codec_type === "video");
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
