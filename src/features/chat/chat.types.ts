import type { UIMessage } from "ai";

export type ChatRequestBody = {
  messages: UIMessage[];
};

export type ChatStreamInput = {
  messages: UIMessage[];
  requestId: string;
};
