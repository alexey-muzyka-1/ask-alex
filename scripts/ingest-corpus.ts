import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { OpenRouterEmbeddingsProvider } from "@/src/features/retrieval/openrouter-embeddings";
import type { CorpusChunk } from "@/src/features/retrieval/retrieval.types";
import {
  assertRequiredCandidateSources,
  buildCandidateTags,
  selectWhitelistedCandidateSources,
  type CandidateSourceType,
} from "@/scripts/candidate-sources";
import { chunkContent } from "@/scripts/chunk-content";
import { redactContent } from "@/scripts/redact-content";

const CANDIDATE_SOURCES_DIR = path.join(
  process.cwd(),
  "src/content/sources/candidate",
);

async function main() {
  const sourceFiles = await getCandidateSourceFiles();

  if (sourceFiles.length === 0) {
    throw new Error(
      "No whitelisted candidate source files found in src/content/sources/candidate.",
    );
  }

  const provider = new OpenRouterEmbeddingsProvider({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_EMBEDDING_MODEL,
  });

  const collectedChunks: CorpusChunk[] = [];

  for (const sourceFile of sourceFiles) {
    const rawText = await readFile(sourceFile.absolutePath, "utf8");
    const sanitized = redactContent(rawText);

    const chunks = chunkContent({
      source: sourceFile.source,
      text: sanitized,
      sourceType: sourceFile.sourceType,
      tags: buildCandidateTags(sourceFile.sourceType),
    });

    for (const chunk of chunks) {
      const embedding = await provider.embed(chunk.text);
      collectedChunks.push({
        chunkId: chunk.chunkId,
        source: chunk.source,
        text: chunk.text,
        sourceType: chunk.sourceType,
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
  sourceType: CandidateSourceType;
  absolutePath: string;
};

async function getCandidateSourceFiles(): Promise<SourceFile[]> {
  const entries = await readdir(CANDIDATE_SOURCES_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name);

  assertRequiredCandidateSources(markdownFiles);

  return selectWhitelistedCandidateSources(markdownFiles).map((sourceSpec) => ({
    source: sourceSpec.fileName,
    sourceType: sourceSpec.sourceType,
    absolutePath: path.join(CANDIDATE_SOURCES_DIR, sourceSpec.fileName),
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
