import { Fragment, type ReactNode } from "react";

function flushParagraph(paragraph: string[], key: string) {
  if (paragraph.length === 0) return null;
  return (
    <p key={key} className="text-sm leading-8 text-white/72 sm:text-base">
      {paragraph.join(" ")}
    </p>
  );
}

function flushList(items: string[], key: string) {
  if (items.length === 0) return null;
  return (
    <ul key={key} className="space-y-2 pl-5 text-sm leading-8 text-white/72 sm:text-base">
      {items.map((item, index) => (
        <li key={`${key}-${index}`} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

function flushCode(lines: string[], key: string) {
  if (lines.length === 0) return null;
  return (
    <pre
      key={key}
      className="overflow-x-auto rounded-3xl border border-white/8 bg-black/35 p-5 text-xs leading-7 text-cyan-100 sm:text-sm"
    >
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

export function DocumentRenderer({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCode = false;
  let blockIndex = 0;

  const flushTextBlocks = () => {
    const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
    if (paragraphBlock) blocks.push(paragraphBlock);
    paragraph = [];

    const listBlock = flushList(listItems, `l-${blockIndex++}`);
    if (listBlock) blocks.push(listBlock);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushTextBlocks();
      if (inCode) {
        const codeBlock = flushCode(codeLines, `c-${blockIndex++}`);
        if (codeBlock) blocks.push(codeBlock);
        codeLines = [];
      }
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushTextBlocks();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushTextBlocks();
      blocks.push(
        <h3 key={`h3-${blockIndex++}`} className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {trimmed.slice(4)}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushTextBlocks();
      blocks.push(
        <h2 key={`h2-${blockIndex++}`} className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {trimmed.slice(3)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushTextBlocks();
      blocks.push(
        <h1 key={`h1-${blockIndex++}`} className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {trimmed.slice(2)}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
      if (paragraphBlock) blocks.push(paragraphBlock);
      paragraph = [];
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
      if (paragraphBlock) blocks.push(paragraphBlock);
      paragraph = [];
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    if (listItems.length > 0) {
      const listBlock = flushList(listItems, `l-${blockIndex++}`);
      if (listBlock) blocks.push(listBlock);
      listItems = [];
    }

    paragraph.push(trimmed);
  }

  flushTextBlocks();
  if (inCode) {
    const codeBlock = flushCode(codeLines, `c-${blockIndex++}`);
    if (codeBlock) blocks.push(codeBlock);
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <Fragment key={`block-${index}`}>{block}</Fragment>
      ))}
    </div>
  );
}
