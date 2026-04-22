import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRequiredCandidateSources,
  buildCandidateTags,
  selectWhitelistedCandidateSources,
} from "../scripts/candidate-sources";

test("selectWhitelistedCandidateSources keeps only approved candidate files", () => {
  const selected = selectWhitelistedCandidateSources([
    "cv.md",
    "selected-posts.md",
    "notes.md",
  ]);

  assert.deepEqual(
    selected.map((entry) => entry.fileName),
    ["cv.md", "selected-posts.md"],
  );
});

test("assertRequiredCandidateSources fails when required files are missing", () => {
  assert.throws(
    () => {
      assertRequiredCandidateSources(["cv.md"]);
    },
    {
      message:
        "Missing required candidate source files: bio.md, projects-highlights.md, selected-stories.md, selected-posts.md",
    },
  );
});

test("buildCandidateTags returns taxonomy tags for source type", () => {
  assert.deepEqual(buildCandidateTags("project-summary"), [
    "candidate",
    "project-summary",
  ]);
});
