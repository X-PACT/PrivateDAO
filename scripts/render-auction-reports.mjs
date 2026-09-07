import fs from "node:fs";
import path from "node:path";

const inputDir = process.argv[2] ?? path.resolve("docs/auction");
const outputDir = process.argv[3] ?? "/tmp/privatedao-auction-reports";
fs.mkdirSync(outputDir, { recursive: true });

function inline(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function render(markdown) {
  const body = [];
  let list = false;
  let code = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("```")) {
      if (list) { body.push("</ul>"); list = false; }
      code = !code;
      body.push(code ? "<pre>" : "</pre>");
      continue;
    }
    if (code) { body.push(`${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}\n`); continue; }
    if (line.startsWith("- ")) { if (!list) { body.push("<ul>"); list = true; } body.push(`<li>${inline(line.slice(2))}</li>`); continue; }
    if (list) { body.push("</ul>"); list = false; }
    if (!line.trim()) { body.push("<div class=\"spacer\"></div>"); continue; }
    if (line.startsWith("# ")) body.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) body.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) body.push(`<h3>${inline(line.slice(4))}</h3>`);
    else body.push(`<p>${inline(line)}</p>`);
  }
  if (list) body.push("</ul>");
  if (code) body.push("</pre>");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 18mm 17mm 17mm; }
body { font-family: Liberation Sans, Arial, sans-serif; color:#172133; font-size:10.2pt; line-height:1.48; }
h1 { color:#101b36; font-size:25pt; margin:0 0 4mm; border-bottom:3px solid #21c5e8; padding-bottom:3mm; }
h2 { color:#143c73; font-size:16pt; margin:9mm 0 3mm; border-left:4px solid #7c4dff; padding-left:3mm; }
h3 { color:#167f96; font-size:12pt; margin:5mm 0 1.5mm; }
p { margin:0 0 3mm; } ul { margin:1mm 0 4mm 6mm; padding-left:5mm; } li { margin:1.2mm 0; }
code { font-family: Liberation Mono, monospace; font-size:8.3pt; color:#273d66; background:#eef4f8; padding:0.5mm 1mm; }
pre { white-space:pre-wrap; background:#f1f5f8; padding:4mm; border-left:3px solid #21c5e8; font:8.2pt Liberation Mono, monospace; }
a { color:#086c9d; text-decoration:none; } strong { color:#101b36; } .spacer { height:1.5mm; }
</style></head><body>${body.join("\n")}</body></html>`;
}

for (const file of fs.readdirSync(inputDir).filter((name) => name.startsWith("PrivateDAO-Confidential-Auctions-") && name.endsWith(".md"))) {
  fs.writeFileSync(path.join(outputDir, file.replace(/\.md$/, ".html")), render(fs.readFileSync(path.join(inputDir, file), "utf8")));
}
console.log(outputDir);
