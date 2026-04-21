import type { UIMessage } from "ai";

import { MessagePart } from "@/src/components/chat/message-part";

type MessageListProps = {
  messages: UIMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Start by asking about Alex&apos;s projects, architecture, or shipping experience.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl border px-3 py-2 text-sm md:max-w-[75%] ${
                isUser
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {message.role}
              </p>
              <div className="space-y-2">
                {message.parts.map((part, index) => (
                  <MessagePart key={`${message.id}-${index}`} part={part} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
