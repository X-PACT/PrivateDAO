import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "apps/web/src/lib/runtime-catalog.generated.ts");
const source = fs.readFileSync(catalogPath, "utf8");
const match = source.match(/export const runtimeCatalog = ([\s\S]*?) as const;\s*$/);
if (!match) throw new Error("Generated runtime catalog export is missing.");

const catalog = JSON.parse(match[1]);
const errors = [];
let bindingCount = 0;
for (const product of catalog.products) {
  for (const capability of product.capabilities) {
    for (const binding of capability.applicationBindings) {
      bindingCount += 1;
      const key = `${product.id}/${capability.id}/${binding.network}`;
      if (binding.mode === "unbound" && binding.entrypoint !== null) {
        errors.push(`${key}: unbound binding has an entrypoint`);
        continue;
      }
      if (binding.mode === "unbound") continue;
      if (typeof binding.entrypoint !== "string" || !binding.entrypoint.startsWith("/api/")) {
        errors.push(`${key}: executable binding has no API entrypoint`);
        continue;
      }
      if (typeof binding.method !== "string") {
        errors.push(`${key}: executable binding has no HTTP method`);
        continue;
      }
      const routePath = path.join(root, "apps/web/src/app", `${binding.entrypoint.slice(1)}/route.ts`);
      if (!fs.existsSync(routePath)) errors.push(`${key}: missing route ${binding.entrypoint}`);
      else {
        const routeSource = fs.readFileSync(routePath, "utf8");
        const methodPattern = new RegExp(`export\\s+async\\s+function\\s+${binding.method}\\b`);
        if (!methodPattern.test(routeSource)) errors.push(`${key}: route ${binding.entrypoint} does not export ${binding.method}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`[application-bindings] PASS products=${catalog.products.length} bindings=${bindingCount}`);
