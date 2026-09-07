import fs from "fs";
import http from "http";
import path from "path";

import { chromium, type Browser } from "playwright-core";

const ROOT = process.cwd();
const SURFACE_DIR = path.resolve(ROOT);

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/brave-browser",
  ].filter(Boolean) as string[];

  const chrome = candidates.find((candidate) => fs.existsSync(candidate));
  if (!chrome) {
    throw new Error(`No Chrome-compatible browser found. Checked: ${candidates.join(", ")}`);
  }
  return chrome;
}

function createStaticServer() {
  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      const normalizedPath =
        url.pathname === "/"
          ? "/index.html"
          : url.pathname === "/PrivateDAO/" || url.pathname === "/PrivateDAO"
            ? "/index.html"
            : url.pathname.startsWith("/PrivateDAO/")
              ? url.pathname.slice("/PrivateDAO".length)
              : url.pathname;
      const requestedPath = decodeURIComponent(normalizedPath);
      const resolvedPath = path.resolve(SURFACE_DIR, `.${requestedPath}`);

      if (!resolvedPath.startsWith(`${SURFACE_DIR}${path.sep}`) && resolvedPath !== SURFACE_DIR) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      const filePath =
        fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()
          ? path.join(resolvedPath, "index.html")
          : resolvedPath;

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath);
      res.writeHead(200, { "content-type": CONTENT_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(500);
      res.end(error instanceof Error ? error.message : String(error));
    }
  });
}

function listen(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to resolve user-operation server port."));
        return;
      }
      resolve(address.port);
    });
  });
}

function close(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function expectVisibleText(page: import("playwright-core").Page, text: string | RegExp) {
  await page.getByText(text).first().waitFor({ state: "visible", timeout: 10_000 });
}

async function main() {
  const chrome = findChrome();
  const server = createStaticServer();
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}/PrivateDAO`;
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({
      executablePath: chrome,
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const failures: string[] = [];

    page.on("pageerror", (error) => {
      if (error.message.includes("Minified React error #418")) {
        return;
      }
      failures.push(`[pageerror] ${error.message}`);
    });
    page.on("requestfailed", (request) => {
      if (request.method() === "HEAD") {
        return;
      }
      const errorText = request.failure()?.errorText || "";
      if (errorText.includes("net::ERR_ABORTED")) {
        return;
      }
      failures.push(`${request.method()} ${request.url()} :: ${errorText}`);
    });

    await page.goto(`${baseUrl}/start/`, { waitUntil: "networkidle" });
    await expectVisibleText(page, "Normal user path");
    await expectVisibleText(page, "Browser only");
    await expectVisibleText(page, "1. Connect");
    await expectVisibleText(page, "2. Run");
    await expectVisibleText(page, "3. Verify");
    await expectVisibleText(page, "4. Understand");
    await expectVisibleText(page, /Solflare first|Phantom|Glow|Backpack|Wallet Standard/);

    const walletTrigger = page.getByRole("button", { name: /connect/i }).first();
    if (await walletTrigger.isDisabled()) {
      throw new Error("Wallet trigger stayed disabled on the normal-user start path.");
    }
    await walletTrigger.click();

    for (const walletName of ["Solflare", "Phantom", "Glow", "Backpack"]) {
      if (!(await page.getByText(walletName).first().isVisible())) {
        throw new Error(`Wallet modal is missing ${walletName}.`);
      }
    }

    await page.goto(`${baseUrl}/govern/`, { waitUntil: "networkidle" });
    await expectVisibleText(page, "Create a DAO");
    await expectVisibleText(page, /submit a proposal|Create Proposal/i);
    await expectVisibleText(page, /commit/i);
    await expectVisibleText(page, /reveal/i);
    await expectVisibleText(page, /finalize/i);
    await expectVisibleText(page, /execute/i);

    await page.goto(`${baseUrl}/proof/?judge=1`, { waitUntil: "networkidle" });
    await expectVisibleText(page, "Normal user path");
    await expectVisibleText(page, /Testnet proof matrix/i);
    await expectVisibleText(page, /standard Testnet lifecycle|create DAO|execute/i);

    await page.goto(`${baseUrl}/documents/testnet-lifecycle-rehearsal-2026-04-19/`, {
      waitUntil: "networkidle",
    });
    await expectVisibleText(page, /43LAj7aNQ7NtRg58um7x3pQu7ieUXE3tPZ3w2RshXhU9Uhb2ZPyWW8rM7QiLWqkLJNRkbRazAXKxuEtv6wNYkKpL/);
    await expectVisibleText(page, /4pP21HhzVz5dgMPjXTNFXDLV2mup5xxXdBp8okAjk5vx164ZWe9WHwDXagJ6y8AipGgjzfSgFypeuZntWNEcZai7/);
    await expectVisibleText(page, /treasury delta|recipient delta/i);

    if (failures.length > 0) {
      throw new Error(`User operation browser flow emitted failures:\n${failures.join("\n")}`);
    }

    console.log("User operation browser flow verification: PASS");
  } finally {
    await browser?.close().catch(() => undefined);
    await close(server);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
