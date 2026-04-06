import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

type ProbeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
};

type ProbeFormat = {
  duration?: string;
};

type Probe = {
  streams?: ProbeStream[];
  format?: ProbeFormat;
};

const ROOT = path.resolve("docs/assets/weekly-updates");
const EXPECTED = [
  "private-dao-week-2-update.mp4",
  "private-dao-week-2-update-poster.png",
  "private-dao-week-3-update.mp4",
  "private-dao-week-3-update-poster.png",
  "private-dao-week-4-update.mp4",
  "private-dao-week-4-update-poster.png",
];

function main() {
  for (const file of EXPECTED) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing weekly update asset: ${file}`);
    }
    const stat = fs.statSync(full);
    if (stat.size <= 1024) {
      throw new Error(`Weekly update asset is unexpectedly small: ${file}`);
    }
  }

  for (const file of EXPECTED.filter((name) => name.endsWith(".mp4"))) {
    const full = path.join(ROOT, file);
    const probe = probeMedia(full);
    const videoStream = (probe.streams || []).find((stream) => stream.codec_type === "video");
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720) {
      throw new Error(`Weekly update video is not 1280x720: ${file}`);
    }
    const duration = Number(probe.format?.duration || "0");
    if (!Number.isFinite(duration) || duration < 34 || duration > 38) {
      throw new Error(`Weekly update video duration is outside the expected range for ${file}: ${duration}`);
    }
  }

  console.log("Weekly update video verification: PASS");
}

function probeMedia(file: string): Probe {
  const output = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
    { encoding: "utf8" },
  );
  return JSON.parse(output) as Probe;
}

main();
