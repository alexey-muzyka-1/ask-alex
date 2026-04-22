export type CandidateSourceType =
  | "bio"
  | "cv"
  | "project-summary"
  | "story"
  | "post";

export type CorpusChunk = {
  chunkId: string;
  text: string;
  source: string;
  sourceType?: CandidateSourceType;
  tags?: string[];
  embedding: number[];
};

export type CandidateHit = {
  chunkId: string;
  source: string;
  sourceType?: CandidateSourceType;
  excerpt: string;
  score: number;
};
