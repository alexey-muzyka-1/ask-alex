"use client";

import { useMemo, useState } from "react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { StarterPrompts } from "@/src/components/chat/starter-prompts";
import { MessageList } from "@/src/components/chat/message-list";

export function ChatShell() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isBusy = status === "submitted" || status === "streaming";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text) {
      return;
    }

    await sendMessage({ text });
    setInput("");
  }

  async function onPromptSelect(prompt: string) {
    if (isBusy) {
      return;
    }

    await sendMessage({ text: prompt });
  }

  async function onExport(messagesToExport: UIMessage[]) {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Ask Alex Conversation",
          messages: messagesToExport,
        }),
      });

      if (!response.ok) {
        throw new Error("Export request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ask-alex-conversation.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (caughtError) {
      setExportError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to export conversation",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 md:px-6">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ask Alex</h1>
          <p className="text-sm text-muted-foreground">
            Chat about Alex Muzyka&apos;s projects, delivery cycles, and engineering decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Stop
            </button>
          ) : null}
          <button
            type="button"
            disabled={messages.length === 0 || isExporting}
            onClick={() => onExport(messages)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </header>

      {messages.length === 0 ? (
        <StarterPrompts onSelect={onPromptSelect} disabled={isBusy} />
      ) : null}

      <section className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-background p-3 md:p-4">
        <MessageList messages={messages} />
      </section>

      <form onSubmit={onSubmit} className="mt-4 space-y-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about architecture, projects, or execution details..."
          className="min-h-24 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            Status: {status}
            {error ? " · error" : ""}
          </div>

          <div className="flex items-center gap-2">
            {error ? (
              <button
                type="button"
                onClick={() => regenerate()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Retry
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isBusy || input.trim().length === 0}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>

        {exportError ? (
          <p className="text-xs text-destructive">{exportError}</p>
        ) : null}
      </form>
    </main>
  );
}
