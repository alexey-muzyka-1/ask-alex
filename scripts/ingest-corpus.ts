import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { OpenAIEmbeddingsProvider } from "@/src/features/retrieval/openai-embeddings";
import type { CorpusChunk } from "@/src/features/retrieval/retrieval.types";
import { chunkContent } from "@/scripts/chunk-content";
import { redactContent } from "@/scripts/redact-content";

const SOURCES_DIR = path.join(process.cwd(), "src/content/sources");

async function main() {
  const sourceFiles = await getSourceFiles();

  if (sourceFiles.length === 0) {
    throw new Error(
      "No source files found in src/content/sources. Add local markdown files before running ingest.",
    );
  }

  const provider = new OpenAIEmbeddingsProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });

  const collectedChunks: CorpusChunk[] = [];

  for (const sourceFile of sourceFiles) {
    const rawText = await readFile(sourceFile.absolutePath, "utf8");
    const sanitized = redactContent(rawText);

    const chunks = chunkContent({
      source: sourceFile.source,
      text: sanitized,
    });

    for (const chunk of chunks) {
      const embedding = await provider.embed(chunk.text);
      collectedChunks.push({
        chunkId: chunk.chunkId,
        source: chunk.source,
        text: chunk.text,
        tags: chunk.tags,
        embedding,
      });
    }
  }

  const outputPath = path.join(process.cwd(), "src/content/corpus.json");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(collectedChunks, null, 2), "utf8");

  console.log(`Generated ${collectedChunks.length} chunks at ${outputPath}`);
}

type SourceFile = {
  source: string;
  absolutePath: string;
};

async function getSourceFiles(): Promise<SourceFile[]> {
  const entries = await readdir(SOURCES_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      source: entry.name,
      absolutePath: path.join(SOURCES_DIR, entry.name),
    }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
