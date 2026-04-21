import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { OpenAIEmbeddingsProvider } from "@/src/features/retrieval/openai-embeddings";
import type { CorpusChunk } from "@/src/features/retrieval/retrieval.types";
import { chunkContent } from "@/scripts/chunk-content";
import { redactContent } from "@/scripts/redact-content";

const SOURCE_FILES = [
  "/Users/a.muzyka/Documents/01 core/obsidian/90 work/Founder CV.md",
  "/Users/a.muzyka/Documents/01 core/obsidian/01 Viralmaxing/Маркетинг/Pitching/YC Application S2026.md",
  "/Users/a.muzyka/Documents/01 core/viralmaxing/saas/CLAUDE.md",
];

async function main() {
  const provider = new OpenAIEmbeddingsProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_EMBEDDING_MODEL,
  });

  const collectedChunks: CorpusChunk[] = [];

  for (const absolutePath of SOURCE_FILES) {
    const fileText = await tryRead(absolutePath);

    if (!fileText) {
      continue;
    }

    const sanitized = redactContent(fileText);
    const relativeSource = path.basename(absolutePath);
    const chunks = chunkContent({
      source: relativeSource,
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

async function tryRead(absolutePath: string): Promise<string | null> {
  try {
    return await readFile(absolutePath, "utf8");
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
