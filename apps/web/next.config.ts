import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
const basePath = configuredBasePath === "/" ? "" : configuredBasePath;
const outputMode = (process.env.PRIVATE_DAO_NEXT_OUTPUT_MODE ?? "export").trim().toLowerCase();

const nextConfig: NextConfig = {
  ...(outputMode === "export" ? { output: "export" as const } : {}),
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  turbopack: {
    root: currentDir,
  },
};

export default nextConfig;
