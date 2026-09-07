import fs from "fs";
import path from "path";

const repositoryBlobBase = "https://github.com/X-PACT/PrivateDAO/blob/main";

export type RepoDocument = {
  title: string;
  relativePath: string;
  routeSegments: string[];
  routePath: string;
  rawHref: string;
  category: string;
};

function docsRoot() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "..", "..", "docs");
}

function walkMarkdownFiles(directory: string, root = directory): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkMarkdownFiles(absolute, root);
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      return [];
    }
    return [path.relative(root, absolute).replace(/\\/g, "/")];
  });
}

function startCase(input: string) {
  return input
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveTitle(relativePath: string, content: string) {
  const heading = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (heading) {
    return heading.replace(/^#\s+/, "").trim();
  }

  return startCase(path.basename(relativePath, ".md"));
}

function deriveCategory(relativePath: string) {
  const segments = relativePath.split("/");
  return segments.length > 1 ? startCase(segments[0]) : "Root docs";
}

function routeSegmentsFor(relativePath: string) {
  return relativePath.replace(/\.md$/i, "").split("/").filter(Boolean);
}

export function getRepoDocuments(): RepoDocument[] {
  const root = docsRoot();
  return walkMarkdownFiles(root)
    .sort((a, b) => a.localeCompare(b))
    .map((relativePath) => {
      const absolute = path.join(root, relativePath);
      const content = fs.readFileSync(absolute, "utf8");
      const routeSegments = routeSegmentsFor(relativePath);
      return {
        title: deriveTitle(relativePath, content),
        relativePath,
        routeSegments,
        routePath: `/viewer/${routeSegments.join("/")}`,
        rawHref: `${repositoryBlobBase}/docs/${relativePath}`,
        category: deriveCategory(relativePath),
      };
    });
}

export function getRepoDocumentBySegments(segments: string[]) {
  const normalizedSegments = segments.filter(Boolean);
  return getRepoDocuments().find((document) => document.routeSegments.join("/") === normalizedSegments.join("/")) ?? null;
}

export function getRepoDocumentContent(segments: string[]) {
  const document = getRepoDocumentBySegments(segments);
  if (!document) return null;

  const absolute = path.join(docsRoot(), document.relativePath);
  return {
    ...document,
    content: fs.readFileSync(absolute, "utf8"),
  };
}
