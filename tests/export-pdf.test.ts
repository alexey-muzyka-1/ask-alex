import test from "node:test";
import assert from "node:assert/strict";

import { exportChatPdf } from "../src/features/export/export-chat-pdf";

test("exportChatPdf generates a valid PDF header", () => {
  const bytes = exportChatPdf({
    title: "Test",
    messages: [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Hello" }],
      },
    ],
  } as never);

  const header = new TextDecoder().decode(bytes.slice(0, 8));
  assert.equal(header.startsWith("%PDF-1.4"), true);
});
