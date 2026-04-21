import { DEFAULT_TOP_K } from "@/src/shared/constants";
import type { EmbeddingProvider } from "@/src/features/retrieval/embedding-provider";
import { rankCorpusChunks } from "@/src/features/retrieval/rank-results";
import { getSnapshotCorpus } from "@/src/features/retrieval/snapshot-corpus";
import type { CandidateHit } from "@/src/features/retrieval/retrieval.types";

type SearchCandidateOptions = {
  provider: EmbeddingProvider;
  query: string;
  topK?: number;
};

export async function searchCandidate({
  provider,
  query,
  topK = DEFAULT_TOP_K,
}: SearchCandidateOptions): Promise<CandidateHit[]> {
  const queryEmbedding = await provider.embed(query);
  const chunks = getSnapshotCorpus();

  return rankCorpusChunks(queryEmbedding, chunks, topK);
}
