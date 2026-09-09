import { readFile } from "node:fs/promises";

function readCatalog(path) {
  return readFile(path, "utf8").then((source) => {
    const match = source.match(/export const runtimeCatalog = ([\s\S]*?) as const;\s*$/);
    if (!match) throw new Error(`runtime catalog export missing in ${path}`);
    return JSON.parse(match[1]);
  });
}

const [generatedPath, committedPath] = process.argv.slice(2);
if (!generatedPath || !committedPath) throw new Error("expected generated and committed catalog paths");

const [generated, committed] = await Promise.all([readCatalog(generatedPath), readCatalog(committedPath)]);
if (JSON.stringify(generated) !== JSON.stringify(committed)) {
  throw new Error("web runtime catalog is out of sync with the Kernel catalog");
}
console.log("web runtime catalog matches the Kernel catalog");
