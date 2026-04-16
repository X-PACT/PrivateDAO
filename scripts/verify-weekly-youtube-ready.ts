import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

type ProbeStream = {
  codec_type?: string;
  codec_name?: string;
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

const ROOT = path.resolve("docs/assets/weekly-youtube-ready");
const EXPECTED_VIDEOS = [
  "Week 1 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4",
  "Week 2 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4",
  "Week 3 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4",
  "Week 4 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4",
];

function main() {
  for (const file of EXPECTED_VIDEOS) {
    const full = path.join(ROOT, file);
    assertExists(full, `Missing weekly YouTube-ready video: ${file}`);
    const probe = probeMedia(full);
    const videoStream = (probe.streams || []).find((stream) => stream.codec_type === "video");
    const audioStream = (probe.streams || []).find((stream) => stream.codec_type === "audio");
    if (!videoStream || videoStream.width !== 1280 || videoStream.height !== 720) {
      throw new Error(`YouTube-ready weekly video is not 1280x720: ${file}`);
    }
    if (!audioStream || audioStream.codec_name !== "aac") {
      throw new Error(`YouTube-ready weekly video is missing AAC audio: ${file}`);
    }
    const duration = Number(probe.format?.duration || "0");
    if (!Number.isFinite(duration) || duration < 42 || duration > 55) {
      throw new Error(`YouTube-ready weekly video duration is outside the expected range for ${file}: ${duration}`);
    }

    const stem = hyphenStem(file);
    assertExists(path.join(ROOT, `${stem}.srt`), `Missing subtitle file for ${file}`, 64);
    assertExists(path.join(ROOT, `${stem}-voice.txt`), `Missing voice script for ${file}`, 64);
    assertExists(path.join(ROOT, `${stem}-voice.wav`), `Missing generated voice WAV for ${file}`, 1024);
    assertExists(path.join(ROOT, `${stem}-intro.mp4`), `Missing intro clip for ${file}`, 1024);
    assertExists(path.join(ROOT, `${stem}-mid.mp4`), `Missing mid clip for ${file}`, 1024);
    assertExists(path.join(ROOT, `${stem}-outro.mp4`), `Missing outro clip for ${file}`, 1024);
    assertExists(path.join(ROOT, `${stem}-sequence.mp4`), `Missing sequence clip for ${file}`, 1024);
  }

  console.log("Weekly YouTube-ready video verification: PASS");
}

function hyphenStem(file: string): string {
  return path.basename(file, ".mp4").replace(/ /g, "-");
}

function assertExists(full: string, message: string, minSize = 1024) {
  if (!fs.existsSync(full)) {
    throw new Error(message);
  }
  const stat = fs.statSync(full);
  if (stat.size <= minSize) {
    throw new Error(`${message} (unexpectedly small file)`);
  }
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
