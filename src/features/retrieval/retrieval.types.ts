export type CorpusChunk = {
  chunkId: string;
  text: string;
  source: string;
  tags?: string[];
  embedding: number[];
};

export type CandidateHit = {
  chunkId: string;
  source: string;
  excerpt: string;
  score: number;
};
