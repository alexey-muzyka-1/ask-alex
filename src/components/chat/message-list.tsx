import type { UIMessage } from "ai";

import { MessagePart } from "@/src/components/chat/message-part";

type MessageListProps = {
  messages: UIMessage[];
  isBusy?: boolean;
};

export function MessageList({ messages, isBusy = false }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-52 items-center justify-center px-4 text-center text-sm text-text-400">
        Начните диалог и задайте вопрос о проектах, архитектуре или поставке.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <article
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[95%] rounded-2xl px-3 py-2.5 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:max-w-[80%] ${
                isUser ? "bg-accent/12" : "bg-bg-100/90"
              }`}
            >
              <div className="space-y-2 text-text-200">
                {message.parts.map((part, index) => (
                  <MessagePart key={`${message.id}-${index}`} part={part} />
                ))}
              </div>
            </div>
          </article>
        );
      })}

      {isBusy ? (
        <article className="flex justify-start" aria-live="polite">
          <div className="max-w-[95%] rounded-2xl bg-bg-100/90 px-3 py-2.5 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:max-w-[80%]">
            <div className="flex items-center gap-2 text-text-300">
              <span
                className="inline-block h-2 w-2 rounded-full bg-accent/70 animate-pulse"
                aria-hidden="true"
              />
              <span className="text-xs">Алекс готовит ответ…</span>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
