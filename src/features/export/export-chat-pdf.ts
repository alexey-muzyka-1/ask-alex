import { readFileSync } from "node:fs";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { UIMessage } from "ai";

import type { ExportChatPdfInput } from "@/src/features/export/export.types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const HEADER_SIZE = 18;
const META_SIZE = 10;
const BODY_SIZE = 12;
const LINE_GAP = 4;
const BLOCK_PADDING = 10;
const BLOCK_MARGIN_BOTTOM = 12;

let cachedFontBytes: Uint8Array | null = null;

export async function exportChatPdf({
  title,
  messages,
}: ExportChatPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const font = await loadPrimaryFont(pdf);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - TOP_MARGIN;

  const headerTitle = title?.trim() || "Экспорт диалога Ask Alex";
  const generatedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  ({ page, cursorY } = drawWrappedText({
    pdf,
    page,
    font,
    text: headerTitle,
    x: MARGIN_X,
    y: cursorY,
    maxWidth: CONTENT_WIDTH,
    fontSize: HEADER_SIZE,
    color: rgb(0.11, 0.11, 0.1),
    lineGap: 6,
  }));

  cursorY -= 4;

  ({ page, cursorY } = drawWrappedText({
    pdf,
    page,
    font,
    text: `Сформировано: ${generatedAt}`,
    x: MARGIN_X,
    y: cursorY,
    maxWidth: CONTENT_WIDTH,
    fontSize: META_SIZE,
    color: rgb(0.45, 0.45, 0.42),
    lineGap: 2,
  }));

  cursorY -= 14;
  drawDivider(page, cursorY);
  cursorY -= 16;

  const transcript = extractTranscript(messages);

  if (transcript.length === 0) {
    ({ page, cursorY } = drawWrappedText({
      pdf,
      page,
      font,
      text: "Диалог пуст. Сообщений пока нет.",
      x: MARGIN_X,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: BODY_SIZE,
      color: rgb(0.22, 0.22, 0.2),
      lineGap: LINE_GAP,
    }));
  } else {
    for (const item of transcript) {
      const lines = wrapParagraphs(item.text, font, BODY_SIZE, CONTENT_WIDTH - BLOCK_PADDING * 2);
      const blockHeight =
        lines.length * (BODY_SIZE + LINE_GAP) + BLOCK_PADDING * 2 - LINE_GAP;

      ({ page, cursorY } = ensureSpace(pdf, page, cursorY, blockHeight + BLOCK_MARGIN_BOTTOM));

      const blockY = cursorY - blockHeight;

      page.drawRectangle({
        x: MARGIN_X,
        y: blockY,
        width: CONTENT_WIDTH,
        height: blockHeight,
        color: item.role === "user" ? rgb(1, 0.95, 0.9) : rgb(0.98, 0.98, 0.97),
        borderColor: rgb(0.86, 0.84, 0.82),
        borderWidth: 0.7,
      });

      let textY = cursorY - BLOCK_PADDING - BODY_SIZE;
      for (const line of lines) {
        page.drawText(line, {
          x: MARGIN_X + BLOCK_PADDING,
          y: textY,
          size: BODY_SIZE,
          font,
          color: rgb(0.16, 0.16, 0.14),
        });

        textY -= BODY_SIZE + LINE_GAP;
      }

      cursorY = blockY - BLOCK_MARGIN_BOTTOM;
    }
  }

  return pdf.save();
}

type TranscriptItem = {
  role: "user" | "assistant";
  text: string;
};

function extractTranscript(messages: UIMessage[]): TranscriptItem[] {
  const items: TranscriptItem[] = [];

  for (const message of messages) {
    const parts = Array.isArray((message as { parts?: unknown[] }).parts)
      ? ((message as { parts?: unknown[] }).parts as unknown[])
      : [];

    const textParts = parts
      .map((part) => {
        if (!part || typeof part !== "object") {
          return "";
        }

        const value = part as Record<string, unknown>;
        if (value.type !== "text") {
          return "";
        }

        return String(value.text ?? "").trim();
      })
      .filter(Boolean);

    const text = textParts.join("\n\n").trim();
    if (!text) {
      continue;
    }

    items.push({
      role: message.role === "user" ? "user" : "assistant",
      text,
    });
  }

  return items;
}

type DrawWrappedTextInput = {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  color: ReturnType<typeof rgb>;
  lineGap: number;
};

function drawWrappedText({
  pdf,
  page,
  font,
  text,
  x,
  y,
  maxWidth,
  fontSize,
  color,
  lineGap,
}: DrawWrappedTextInput): { page: PDFPage; cursorY: number } {
  const lines = wrapParagraphs(text, font, fontSize, maxWidth);
  let currentPage = page;
  let cursorY = y;

  for (const line of lines) {
    ({ page: currentPage, cursorY } = ensureSpace(
      pdf,
      currentPage,
      cursorY,
      fontSize + lineGap,
    ));

    currentPage.drawText(line, {
      x,
      y: cursorY,
      size: fontSize,
      font,
      color,
    });

    cursorY -= fontSize + lineGap;
  }

  return { page: currentPage, cursorY };
}

function wrapParagraphs(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [];
  }

  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const wrapped = wrapByWidth(paragraph, font, fontSize, maxWidth);
    lines.push(...wrapped);
  }

  return lines;
}

function wrapByWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = "";
    }

    if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      currentLine = word;
      continue;
    }

    const fragments = splitLongWord(word, font, fontSize, maxWidth);
    lines.push(...fragments.slice(0, -1));
    currentLine = fragments[fragments.length - 1] ?? "";
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function splitLongWord(
  word: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const fragments: string[] = [];
  let current = "";

  for (const char of Array.from(word)) {
    const candidate = `${current}${char}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      fragments.push(current);
      current = char;
    } else {
      fragments.push(char);
      current = "";
    }
  }

  if (current) {
    fragments.push(current);
  }

  return fragments;
}

function ensureSpace(
  pdf: PDFDocument,
  page: PDFPage,
  cursorY: number,
  requiredHeight: number,
): { page: PDFPage; cursorY: number } {
  if (cursorY - requiredHeight >= BOTTOM_MARGIN) {
    return { page, cursorY };
  }

  const nextPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  return {
    page: nextPage,
    cursorY: PAGE_HEIGHT - TOP_MARGIN,
  };
}

function drawDivider(page: PDFPage, y: number) {
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 0.7,
    color: rgb(0.85, 0.84, 0.82),
    opacity: 0.9,
  });
}

async function loadPrimaryFont(pdf: PDFDocument): Promise<PDFFont> {
  try {
    if (!cachedFontBytes) {
      const fontPath = path.join(process.cwd(), "src/assets/fonts/Geist-Regular.ttf");
      cachedFontBytes = new Uint8Array(readFileSync(fontPath));
    }

    return await pdf.embedFont(cachedFontBytes, { subset: true });
  } catch {
    return pdf.embedFont(StandardFonts.Helvetica);
  }
}
