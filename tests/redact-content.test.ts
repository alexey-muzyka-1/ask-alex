import test from "node:test";
import assert from "node:assert/strict";

import { redactContent } from "../scripts/redact-content";

test("redactContent masks api keys and local paths", () => {
  const input = "key sk-12345678901234567890 and path /Users/test/private/file.txt";
  const output = redactContent(input);

  assert.equal(output.includes("sk-12345678901234567890"), false);
  assert.equal(output.includes("/Users/test"), false);
  assert.equal(output.includes("[REDACTED_API_KEY]"), true);
  assert.equal(output.includes("[REDACTED_LOCAL_PATH]"), true);
});
