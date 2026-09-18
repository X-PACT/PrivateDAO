import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "../..");
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
const basePath = configuredBasePath === "/" ? "" : configuredBasePath;
const outputMode = (process.env.PRIVATE_DAO_NEXT_OUTPUT_MODE ?? "export").trim().toLowerCase();
const distDir = process.env.PRIVATE_DAO_NEXT_DIST_DIR?.trim() || ".next";

const nextConfig: NextConfig = {
  ...(outputMode === "export" ? { output: "export" as const } : {}),
  distDir,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
