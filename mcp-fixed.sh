#!/usr/bin/env bash
set -e
PORT=3333
ROOT_DIR="$(pwd)"

mkdir -p .mcp-fixed
cd .mcp-fixed

cat > package.json <<'PKG'
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "express": "latest",
    "zod": "latest"
  }
}
PKG

npm install

cat > server.js <<'JS'
import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const ROOT = process.env.ROOT_DIR;
const app = express();

let transport;

function safe(p) {
  const full = path.resolve(ROOT, p || ".");
  if (!full.startsWith(ROOT)) throw new Error("Outside project blocked");
  return full;
}

const server = new McpServer({
  name: "PrivateDAO MCP",
  version: "1.0.0"
});

server.tool("list_dir", { dir: z.string().default(".") }, async ({ dir }) => ({
  content: [{ type: "text", text: fs.readdirSync(safe(dir)).join("\n") }]
}));

server.tool("read_file", { file: z.string() }, async ({ file }) => ({
  content: [{ type: "text", text: fs.readFileSync(safe(file), "utf8") }]
}));

server.tool("write_file", { file: z.string(), content: z.string() }, async ({ file, content }) => {
  fs.writeFileSync(safe(file), content);
  return { content: [{ type: "text", text: "written" }] };
});

server.tool("run_command", { command: z.string(), cwd: z.string().default(".") }, async ({ command, cwd }) => {
  return await new Promise((resolve) => {
    exec(command, { cwd: safe(cwd), timeout: 120000, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      resolve({ content: [{ type: "text", text: `exit=${err?.code ?? 0}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}` }] });
    });
  });
});

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) return res.status(400).send("No active SSE transport");
  await transport.handlePostMessage(req, res);
});

app.listen(3333, "0.0.0.0", () => {
  console.log("MCP READY: http://127.0.0.1:3333/sse");
});
JS

ROOT_DIR="$ROOT_DIR" node server.js
