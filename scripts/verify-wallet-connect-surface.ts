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

      if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(resolvedPath);
      res.writeHead(200, { "content-type": CONTENT_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(resolvedPath).pipe(res);
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
        reject(new Error("Unable to resolve wallet-surface server port."));
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

async function main() {
  const chrome = findChrome();
  const server = createStaticServer();
  const port = await listen(server);
  const url = `http://127.0.0.1:${port}/PrivateDAO/`;
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

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);

    const button = page.getByRole("button", { name: /connect/i }).first();
    const buttonText = (await button.textContent())?.trim();
    const isDisabled = await button.isDisabled();

    if (!buttonText?.toLowerCase().includes("connect")) {
      throw new Error(`Wallet trigger did not render the expected label. Saw: ${buttonText ?? "empty"}`);
    }

    if (isDisabled) {
      throw new Error("Wallet trigger stayed disabled after hydration.");
    }

    await button.click();
    await page.getByText("Solflare").first().waitFor({ state: "visible", timeout: 5000 });

    for (const walletName of ["Solflare", "Phantom", "Glow", "Backpack"]) {
      const walletOption = page.getByText(walletName).first();
      if (!(await walletOption.isVisible())) {
        throw new Error(`Wallet modal is missing ${walletName}.`);
      }
    }

    if (failures.length > 0) {
      throw new Error(`Wallet surface emitted failures:\n${failures.join("\n")}`);
    }

    console.log("Wallet connect surface verification: PASS");
  } finally {
    await browser?.close().catch(() => undefined);
    await close(server);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
