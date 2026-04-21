import type { CandidateHit, CorpusChunk } from "@/src/features/retrieval/retrieval.types";

export function rankCorpusChunks(
  queryEmbedding: number[],
  chunks: CorpusChunk[],
  topK: number,
): CandidateHit[] {
  return chunks
    .map((chunk) => ({
      chunkId: chunk.chunkId,
      source: chunk.source,
      excerpt: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .map((hit) => ({
      ...hit,
      score: Number(hit.score.toFixed(6)),
    }));
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const dimensions = Math.min(left.length, right.length);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < dimensions; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
