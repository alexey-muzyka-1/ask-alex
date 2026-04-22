import test from "node:test";
import assert from "node:assert/strict";

import { cosineSimilarity, rankCorpusChunks } from "../src/features/retrieval/rank-results";

test("cosineSimilarity returns 1 for identical vectors", () => {
  const score = cosineSimilarity([1, 2, 3], [1, 2, 3]);
  assert.equal(Number(score.toFixed(6)), 1);
});

test("rankCorpusChunks sorts by descending score", () => {
  const hits = rankCorpusChunks(
    [1, 0, 0],
    [
      {
        chunkId: "a",
        source: "s1",
        sourceType: "cv",
        text: "alpha",
        embedding: [1, 0, 0],
      },
      {
        chunkId: "b",
        source: "s2",
        tags: ["candidate", "story"],
        text: "beta",
        embedding: [0, 1, 0],
      },
    ],
    2,
  );

  assert.equal(hits[0]?.chunkId, "a");
  assert.equal(hits[0]?.sourceType, "cv");
  assert.equal(hits[1]?.chunkId, "b");
  assert.equal(hits[1]?.sourceType, "story");
});
