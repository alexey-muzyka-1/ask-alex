import type { UIMessage } from "ai";

import type { ExportChatPdfInput } from "@/src/features/export/export.types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 50;
const MARGIN_TOP = 790;
const LINE_HEIGHT = 14;
const MAX_LINE_CHARS = 86;
const MAX_LINES_PER_PAGE = 50;

export function exportChatPdf({ title, messages }: ExportChatPdfInput): Uint8Array {
  const lines = buildDocumentLines(title, messages);
  const pages = paginate(lines, MAX_LINES_PER_PAGE);

  return buildPdfFromPages(pages);
}

function buildDocumentLines(title: string | undefined, messages: UIMessage[]): string[] {
  const headerTitle = title?.trim() || "Ask Alex Conversation Export";
  const generatedAt = new Date().toISOString();

  const lines: string[] = [
    headerTitle,
    `Generated at: ${generatedAt}`,
    "",
  ];

  for (const message of messages) {
    const role = message.role.toUpperCase();
    lines.push(`${role}:`);

    const parts = Array.isArray((message as { parts?: unknown[] }).parts)
      ? ((message as { parts?: unknown[] }).parts as unknown[])
      : [];

    if (parts.length === 0) {
      lines.push("(no content)");
      lines.push("");
      continue;
    }

    for (const part of parts) {
      const text = stringifyMessagePart(part);
      if (!text) {
        continue;
      }

      for (const wrapped of wrapLine(text, MAX_LINE_CHARS)) {
        lines.push(wrapped);
      }
    }

    lines.push("");
  }

  if (lines.length === 3) {
    lines.push("No messages in this export.");
  }

  return lines;
}

function stringifyMessagePart(part: unknown): string | null {
  if (!part || typeof part !== "object") {
    return null;
  }

  const value = part as Record<string, unknown>;
  const type = typeof value.type === "string" ? value.type : "unknown";

  if (type === "text") {
    return String(value.text ?? "");
  }

  if (type.startsWith("tool-")) {
    const state = typeof value.state === "string" ? value.state : "unknown";

    if (state === "output-available") {
      return `${type} [output]: ${safeJson(value.output)}`;
    }

    if (state === "output-error") {
      return `${type} [error]: ${String(value.errorText ?? "Unknown tool error")}`;
    }

    if (state === "input-available") {
      return `${type} [input]: ${safeJson(value.input)}`;
    }

    return `${type} [${state}]`;
  }

  return `${type}: ${safeJson(value)}`;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

function wrapLine(text: string, maxChars: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function paginate(lines: string[], maxLinesPerPage: number): string[][] {
  if (lines.length === 0) {
    return [[""]];
  }

  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  return pages;
}

function buildPdfFromPages(pages: string[][]): Uint8Array {
  const objects = new Map<number, string>();

  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds: number[] = [];
  const pageCount = pages.length;

  for (let index = 0; index < pageCount; index += 1) {
    pageObjectIds.push(3 + index * 2);
  }

  const fontObjectId = 3 + pageCount * 2;

  objects.set(
    2,
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pageCount} >>`,
  );

  for (let index = 0; index < pages.length; index += 1) {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;

    const contentStream = buildPageContentStream(pages[index] ?? []);

    objects.set(
      pageObjectId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
    );

    objects.set(
      contentObjectId,
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    );
  }

  objects.set(
    fontObjectId,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  );

  const objectCount = fontObjectId;
  const lines: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = new Array(objectCount + 1).fill(0);

  for (let objectId = 1; objectId <= objectCount; objectId += 1) {
    offsets[objectId] = lines.join("").length;
    lines.push(`${objectId} 0 obj\n${objects.get(objectId)}\nendobj\n`);
  }

  const xrefOffset = lines.join("").length;
  lines.push(`xref\n0 ${objectCount + 1}\n`);
  lines.push("0000000000 65535 f \n");

  for (let objectId = 1; objectId <= objectCount; objectId += 1) {
    lines.push(`${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`);
  }

  lines.push(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return new TextEncoder().encode(lines.join(""));
}

function buildPageContentStream(lines: string[]): string {
  const commands: string[] = [
    "BT",
    "/F1 11 Tf",
    `${MARGIN_LEFT} ${MARGIN_TOP} Td`,
  ];

  lines.forEach((line, index) => {
    const printable = sanitizeTextForPdf(line);
    commands.push(`(${escapePdfText(printable)}) Tj`);

    if (index < lines.length - 1) {
      commands.push(`0 -${LINE_HEIGHT} Td`);
    }
  });

  commands.push("ET");
  return commands.join("\n");
}

function sanitizeTextForPdf(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
