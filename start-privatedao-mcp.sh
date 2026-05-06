#!/usr/bin/env bash
set -e

PORT=3333
TOKEN=$(openssl rand -hex 16)
ROOT_DIR="$(pwd)"

mkdir -p .mcp-server
cd .mcp-server

cat > package.json <<'PKG'
{
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "express": "latest",
    "zod": "latest",
    "localtunnel": "latest"
  }
}
PKG

npm install

cat > server.js <<'JS'
import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const ROOT = process.env.ROOT_DIR;
const TOKEN = process.env.MCP_TOKEN;
const app = express();
const transports = {};

function safePath(p) {
  const full = path.resolve(ROOT, p || ".");
  if (!full.startsWith(ROOT)) throw new Error("Blocked: path outside project");
  return full;
}

function blockedCommand(cmd) {
  return /rm\s+-rf\s+\/|mkfs|dd\s+if=|shutdown|reboot|passwd|sudo\s+rm|chmod\s+-R\s+777\s+\//i.test(cmd);
}

const server = new McpServer({
  name: "PrivateDAO Local Dev MCP",
  version: "1.0.0"
});

server.tool("list_dir", { dir: z.string().default(".") }, async ({ dir }) => {
  const items = fs.readdirSync(safePath(dir)).join("\n");
  return { content: [{ type: "text", text: items }] };
});

server.tool("read_file", { file: z.string() }, async ({ file }) => {
  const text = fs.readFileSync(safePath(file), "utf8");
  return { content: [{ type: "text", text }] };
});

server.tool("write_file", {
  file: z.string(),
  content: z.string()
}, async ({ file, content }) => {
  fs.writeFileSync(safePath(file), content);
  return { content: [{ type: "text", text: "written" }] };
});

server.tool("run_command", {
  command: z.string(),
  cwd: z.string().default(".")
}, async ({ command, cwd }) => {
  if (blockedCommand(command)) throw new Error("Blocked dangerous command");
  return await new Promise((resolve) => {
    exec(command, {
      cwd: safePath(cwd),
      timeout: 120000,
      maxBuffer: 1024 * 1024 * 10
    }, (err, stdout, stderr) => {
      resolve({
        content: [{
          type: "text",
          text: `EXIT: ${err?.code ?? 0}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
        }]
      });
    });
  });
});

server.tool("open_browser", {
  url: z.string()
}, async ({ url }) => {
  exec(`xdg-open "${url.replaceAll('"', '\\"')}"`);
  return { content: [{ type: "text", text: "browser opened" }] };
});

app.get("/sse", async (req, res) => {
  if (req.query.token !== TOKEN) return res.status(401).send("Unauthorized");
  const transport = new SSEServerTransport(`/messages?token=${TOKEN}`, res);
  transports[transport.sessionId] = transport;
  res.on("close", () => delete transports[transport.sessionId]);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (req.query.token !== TOKEN) return res.status(401).send("Unauthorized");
  const transport = transports[req.query.sessionId];
  if (!transport) return res.status(400).send("No transport");
  await transport.handlePostMessage(req, res);
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`LOCAL: http://127.0.0.1:${process.env.PORT}/sse?token=${TOKEN}`);
});
JS

export ROOT_DIR="$ROOT_DIR"
export MCP_TOKEN="$TOKEN"
export PORT="$PORT"

node server.js &
SERVER_PID=$!

npx localtunnel --port "$PORT" --print-requests > tunnel.log 2>&1 &
sleep 5

URL=$(grep -o 'https://[^ ]*\.loca\.lt' tunnel.log | head -n1)

echo ""
echo "ضع هذا الرابط في MCP Server URL:"
echo "${URL}/sse?token=${TOKEN}"
echo ""
echo "اترك الترمينال مفتوح. للإيقاف اضغط Ctrl+C"
wait $SERVER_PID
