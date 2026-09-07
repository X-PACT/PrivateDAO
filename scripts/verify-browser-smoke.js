"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const ROOT = process.cwd();
const SURFACE_DIR = path_1.default.resolve(ROOT);
const REQUIRED_DOM_FRAGMENTS = [
    "PrivateDAO",
    "Private governance on Solana",
    "Powered by the live stack",
    "Open verification view",
    "The shortest path from landing page to a real Devnet action",
    "Public good",
    "How the stack maps to services",
    "Support the mission",
];
const CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
};
function findChrome() {
    const candidates = [
        process.env.CHROME_PATH,
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/brave-browser",
    ].filter(Boolean);
    const chrome = candidates.find((candidate) => fs_1.default.existsSync(candidate));
    if (!chrome) {
        throw new Error(`No Chrome-compatible browser found. Set CHROME_PATH or install Chrome/Chromium/Brave. Checked: ${candidates.join(", ")}`);
    }
    return chrome;
}
function createStaticServer() {
    const server = http_1.default.createServer((req, res) => {
        try {
            const url = new URL(req.url || "/", "http://127.0.0.1");
            const normalizedPath = url.pathname === "/"
                ? "/index.html"
                : url.pathname === "/PrivateDAO/" || url.pathname === "/PrivateDAO"
                    ? "/index.html"
                    : url.pathname.startsWith("/PrivateDAO/")
                        ? url.pathname.slice("/PrivateDAO".length)
                        : url.pathname;
            const requestedPath = decodeURIComponent(normalizedPath);
            const resolvedPath = path_1.default.resolve(SURFACE_DIR, `.${requestedPath}`);
            if (!resolvedPath.startsWith(`${SURFACE_DIR}${path_1.default.sep}`) && resolvedPath !== SURFACE_DIR) {
                res.writeHead(403);
                res.end("Forbidden");
                return;
            }
            if (!fs_1.default.existsSync(resolvedPath) || fs_1.default.statSync(resolvedPath).isDirectory()) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            const ext = path_1.default.extname(resolvedPath);
            res.writeHead(200, { "content-type": CONTENT_TYPES[ext] || "application/octet-stream" });
            fs_1.default.createReadStream(resolvedPath).pipe(res);
        }
        catch (error) {
            res.writeHead(500);
            res.end(error instanceof Error ? error.message : String(error));
        }
    });
    return server;
}
function listen(server) {
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            if (!address || typeof address === "string") {
                reject(new Error("Unable to resolve browser-smoke server port."));
                return;
            }
            resolve(address.port);
        });
    });
}
function close(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
}
function runChrome(chrome, args, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(chrome, args, { stdio: ["ignore", "pipe", "pipe"] });
        const stdout = [];
        const stderr = [];
        const timeout = setTimeout(() => {
            child.kill("SIGKILL");
            reject(new Error(`Chrome timed out after ${timeoutMs}ms while running: ${args.join(" ")}`));
        }, timeoutMs);
        child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
        child.stderr.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
        child.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
        child.on("close", (code) => {
            clearTimeout(timeout);
            const out = Buffer.concat(stdout).toString("utf8");
            const err = Buffer.concat(stderr).toString("utf8");
            if (code !== 0) {
                reject(new Error(`Chrome exited with code ${code}\n${err}`));
                return;
            }
            resolve({ stdout: out, stderr: err });
        });
    });
}
async function main() {
    const chrome = findChrome();
    const server = createStaticServer();
    const port = await listen(server);
    const url = `http://127.0.0.1:${port}/PrivateDAO/`;
    const screenshotPath = path_1.default.join(os_1.default.tmpdir(), `privatedao-browser-smoke-${Date.now()}.png`);
    const chromeBaseArgs = [
        "--headless",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-extensions",
        "--disable-features=MediaRouter,OptimizationHints,Translate,PaintHolding",
        "--no-sandbox",
        "--no-first-run",
        "--noerrdialogs",
        "--disable-dev-shm-usage",
        "--window-size=1440,1200",
    ];
    try {
        const domResult = await runChrome(chrome, [...chromeBaseArgs, "--dump-dom", url], 45000);
        for (const fragment of REQUIRED_DOM_FRAGMENTS) {
            if (!domResult.stdout.includes(fragment)) {
                throw new Error(`Browser DOM is missing required fragment: ${fragment}`);
            }
        }
        await runChrome(chrome, [...chromeBaseArgs, `--screenshot=${screenshotPath}`, url], 90000);
        const screenshotSize = fs_1.default.statSync(screenshotPath).size;
        if (screenshotSize < 100000) {
            throw new Error(`Browser screenshot is unexpectedly small: ${screenshotSize} bytes`);
        }
        console.log(`Browser smoke verification: PASS (${path_1.default.basename(screenshotPath)}, ${screenshotSize} bytes)`);
    }
    finally {
        await close(server);
    }
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
