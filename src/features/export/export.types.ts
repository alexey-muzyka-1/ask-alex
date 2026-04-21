import type { UIMessage } from "ai";

export type ExportChatPdfInput = {
  title?: string;
  messages: UIMessage[];
};
