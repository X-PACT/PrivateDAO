import { Fragment, type ReactNode } from "react";

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${matchIndex++}`}
          className="rounded-md border border-white/10 bg-black/28 px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-100"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${matchIndex++}`} className="font-semibold text-white/90">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2];
        const isExternal = /^https?:\/\//.test(href);
        nodes.push(
          <a
            key={`${keyPrefix}-link-${matchIndex++}`}
            className="text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 transition hover:text-cyan-100"
            href={href}
            rel={isExternal ? "noreferrer" : undefined}
            target={isExternal ? "_blank" : undefined}
          >
            {link[1]}
          </a>,
        );
      }
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function flushParagraph(paragraph: string[], key: string) {
  if (paragraph.length === 0) return null;
  const text = paragraph.join(" ");
  return (
    <p key={key} className="text-sm leading-8 text-white/72 sm:text-base">
      {parseInline(text, key)}
    </p>
  );
}

function flushList(items: string[], key: string) {
  if (items.length === 0) return null;
  return (
    <ul key={key} className="space-y-2 pl-5 text-sm leading-8 text-white/72 sm:text-base">
      {items.map((item, index) => (
        <li key={`${key}-${index}`} className="list-disc">
          {parseInline(item, `${key}-${index}`)}
        </li>
      ))}
    </ul>
  );
}

function flushOrderedList(items: string[], key: string) {
  if (items.length === 0) return null;
  return (
    <ol key={key} className="space-y-2 pl-5 text-sm leading-8 text-white/72 sm:text-base">
      {items.map((item, index) => (
        <li key={`${key}-${index}`} className="list-decimal">
          {parseInline(item, `${key}-${index}`)}
        </li>
      ))}
    </ol>
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

function isTableLine(line: string) {
  return line.startsWith("|") && line.endsWith("|");
}

function isTableSeparator(line: string) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|$/.test(line);
}

function parseTableRow(line: string) {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function flushTable(lines: string[], key: string) {
  if (lines.length < 2 || !isTableSeparator(lines[1])) return null;
  const headers = parseTableRow(lines[0]);
  const rows = lines.slice(2).map(parseTableRow);

  return (
    <div key={key} className="overflow-x-auto rounded-3xl border border-white/10 bg-black/20">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/70">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-100/90">
          <tr>
            {headers.map((header, index) => (
              <th key={`${key}-h-${index}`} className="px-4 py-3 font-semibold">
                {parseInline(header, `${key}-h-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {rows.map((row, rowIndex) => (
            <tr key={`${key}-r-${rowIndex}`} className="align-top">
              {headers.map((_, cellIndex) => (
                <td key={`${key}-r-${rowIndex}-c-${cellIndex}`} className="px-4 py-3 leading-7">
                  {parseInline(row[cellIndex] ?? "", `${key}-r-${rowIndex}-c-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function flushTableOrParagraph(lines: string[], key: string) {
  if (lines.length === 0) return null;
  return flushTable(lines, key) ?? flushParagraph(lines, `${key}-fallback`);
}

export function DocumentRenderer({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let codeLines: string[] = [];
  let tableLines: string[] = [];
  let inCode = false;
  let blockIndex = 0;

  const flushTextBlocks = () => {
    const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
    if (paragraphBlock) blocks.push(paragraphBlock);
    paragraph = [];

    const listBlock = flushList(listItems, `l-${blockIndex++}`);
    if (listBlock) blocks.push(listBlock);
    listItems = [];

    const orderedListBlock = flushOrderedList(orderedListItems, `ol-${blockIndex++}`);
    if (orderedListBlock) blocks.push(orderedListBlock);
    orderedListItems = [];

    const tableBlock = flushTableOrParagraph(tableLines, `t-${blockIndex++}`);
    if (tableBlock) blocks.push(tableBlock);
    tableLines = [];
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

    if (isTableLine(trimmed)) {
      const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
      if (paragraphBlock) blocks.push(paragraphBlock);
      paragraph = [];

      const listBlock = flushList(listItems, `l-${blockIndex++}`);
      if (listBlock) blocks.push(listBlock);
      listItems = [];

      const orderedListBlock = flushOrderedList(orderedListItems, `ol-${blockIndex++}`);
      if (orderedListBlock) blocks.push(orderedListBlock);
      orderedListItems = [];

      tableLines.push(trimmed);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushTextBlocks();
      blocks.push(
        <h3 key={`h3-${blockIndex++}`} className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {parseInline(trimmed.slice(4), `h3-${blockIndex}`)}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushTextBlocks();
      blocks.push(
        <h2 key={`h2-${blockIndex++}`} className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {parseInline(trimmed.slice(3), `h2-${blockIndex}`)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushTextBlocks();
      blocks.push(
        <h1 key={`h1-${blockIndex++}`} className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {parseInline(trimmed.slice(2), `h1-${blockIndex}`)}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
      if (paragraphBlock) blocks.push(paragraphBlock);
      paragraph = [];
      const tableBlock = flushTableOrParagraph(tableLines, `t-${blockIndex++}`);
      if (tableBlock) blocks.push(tableBlock);
      tableLines = [];
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const paragraphBlock = flushParagraph(paragraph, `p-${blockIndex++}`);
      if (paragraphBlock) blocks.push(paragraphBlock);
      paragraph = [];
      const tableBlock = flushTableOrParagraph(tableLines, `t-${blockIndex++}`);
      if (tableBlock) blocks.push(tableBlock);
      tableLines = [];
      orderedListItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    if (listItems.length > 0) {
      const listBlock = flushList(listItems, `l-${blockIndex++}`);
      if (listBlock) blocks.push(listBlock);
      listItems = [];
    }
    if (orderedListItems.length > 0) {
      const orderedListBlock = flushOrderedList(orderedListItems, `ol-${blockIndex++}`);
      if (orderedListBlock) blocks.push(orderedListBlock);
      orderedListItems = [];
    }
    if (tableLines.length > 0) {
      const tableBlock = flushTableOrParagraph(tableLines, `t-${blockIndex++}`);
      if (tableBlock) blocks.push(tableBlock);
      tableLines = [];
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
