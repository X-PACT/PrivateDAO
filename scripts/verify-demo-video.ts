import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const VIDEO = path.resolve(ROOT, "docs/assets/private-dao-demo-flow.mp4");
const POSTER = path.resolve(ROOT, "docs/assets/private-dao-demo-flow-poster.png");
const DESKTOP_DIR = "/home/x-pact/Desktop/PrivateDAO-Demo-Video";
const DESKTOP_VIDEO = path.join(
  DESKTOP_DIR,
  "PrivateDAO - Real Demo Flow - Create DAO Submit Proposal Private Vote Execute Treasury.mp4"
);

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
  for (const file of [VIDEO, POSTER, DESKTOP_VIDEO]) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing expected demo asset: ${file}`);
    }
  }

  const probe = ffprobe(VIDEO);
  const videoStream = (probe.streams || []).find((stream: any) => stream.codec_type === "video");
  if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720) {
    throw new Error("Demo video is not 1280x720.");
  }
  const duration = Number(probe.format?.duration || 0);
  if (!(duration >= 30 && duration <= 40)) {
    throw new Error(`Demo video duration is outside expected range: ${duration}`);
  }

  console.log("Demo video verification: PASS");
}

main();
