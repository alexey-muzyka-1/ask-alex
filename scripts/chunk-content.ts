import { createHash } from "node:crypto";

type ChunkTextOptions = {
  source: string;
  text: string;
  targetWords?: number;
  overlapWords?: number;
};

export type ChunkedDocument = {
  chunkId: string;
  source: string;
  text: string;
  tags?: string[];
};

export function chunkContent({
  source,
  text,
  targetWords = 90,
  overlapWords = 20,
}: ChunkTextOptions): ChunkedDocument[] {
  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  const chunks: ChunkedDocument[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + targetWords, words.length);
    const chunkWords = words.slice(start, end);
    const chunkText = chunkWords.join(" ");
    const hash = createHash("sha1")
      .update(`${source}:${start}:${chunkText}`)
      .digest("hex")
      .slice(0, 12);

    chunks.push({
      chunkId: `${sanitizeSource(source)}-${hash}`,
      source,
      text: chunkText,
    });

    if (end === words.length) {
      break;
    }

    start = Math.max(0, end - overlapWords);
  }

  return chunks;
}

function sanitizeSource(source: string): string {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
