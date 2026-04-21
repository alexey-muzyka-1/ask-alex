import corpus from "@/src/content/corpus.json";
import type { CorpusChunk } from "@/src/features/retrieval/retrieval.types";

export function getSnapshotCorpus(): CorpusChunk[] {
  return corpus as CorpusChunk[];
}
