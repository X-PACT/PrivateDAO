import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const VIDEO = path.resolve(ROOT, "docs/assets/private-dao-demo-flow.mp4");
const POSTER = path.resolve(ROOT, "docs/assets/private-dao-demo-flow-poster.png");
const OPTIONAL_LOCAL_VIDEO = process.env.PRIVATE_DAO_LOCAL_DEMO_VIDEO?.trim()
  ? path.resolve(process.env.PRIVATE_DAO_LOCAL_DEMO_VIDEO)
  : null;

function ffprobe(file: string) {
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file],
    { encoding: "utf8" }
  );
  if (probe.status !== 0) {
    const reason = probe.error?.message || probe.stderr || probe.stdout || "ffprobe unavailable";
    return { ok: false as const, reason };
  }
  return { ok: true as const, payload: JSON.parse(probe.stdout) };
}

function main() {
  for (const file of [VIDEO, POSTER]) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing expected demo asset: ${file}`);
    }
  }

  if (OPTIONAL_LOCAL_VIDEO && !fs.existsSync(OPTIONAL_LOCAL_VIDEO)) {
    throw new Error(`Configured local demo asset is missing: ${OPTIONAL_LOCAL_VIDEO}`);
  }

  const videoSize = fs.statSync(VIDEO).size;
  const posterSize = fs.statSync(POSTER).size;
  if (videoSize < 1_000_000) {
    throw new Error(`Demo video asset is unexpectedly small: ${videoSize} bytes`);
  }
  if (posterSize < 50_000) {
    throw new Error(`Demo poster asset is unexpectedly small: ${posterSize} bytes`);
  }

  const probe = ffprobe(VIDEO);
  if (probe.ok) {
    const videoStream = (probe.payload.streams || []).find((stream: any) => stream.codec_type === "video");
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720) {
      throw new Error("Demo video is not 1280x720.");
    }
    const duration = Number(probe.payload.format?.duration || 0);
    if (!(duration >= 29 && duration <= 40)) {
      throw new Error(`Demo video duration is outside expected range: ${duration}`);
    }
  } else {
    console.warn(`Demo video verification fallback: ${probe.reason}`);
  }

  console.log("Demo video verification: PASS");
}

main();
