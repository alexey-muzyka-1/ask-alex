import test from "node:test";
import assert from "node:assert/strict";

import { toolFailure, toolSuccess } from "../src/features/chat/tool-envelope";

test("toolSuccess returns ok envelope", () => {
  const value = toolSuccess({ hits: [] });
  assert.equal(value.ok, true);
});

test("toolFailure returns error envelope", () => {
  const value = toolFailure("X", "failed", true);
  assert.equal(value.ok, false);
  if (!value.ok) {
    assert.equal(value.error.code, "X");
    assert.equal(value.error.retryable, true);
  }
});
