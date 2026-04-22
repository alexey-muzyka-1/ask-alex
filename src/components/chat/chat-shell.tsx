"use client";

import { useMemo, useState } from "react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Code2, Download, RefreshCcw, Square } from "lucide-react";
import Image from "next/image";

import ClaudeStyleChatInput, {
  type ClaudeChatInputSubmit,
} from "@/components/ui/claude-style-chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageList } from "@/src/components/chat/message-list";
import { StarterPrompts } from "@/src/components/chat/starter-prompts";

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

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isBusy = status === "submitted" || status === "streaming";

  async function onPromptSelect(prompt: string) {
    if (isBusy) {
      return;
    }

    await sendMessage({ text: prompt });
  }

  async function onSendFromComposer(payload: ClaudeChatInputSubmit) {
    if (isBusy) {
      return;
    }

    const text = payload.message.trim();
    if (!text) {
      return;
    }

    await sendMessage({ text });
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
          title: "Диалог Ask Alex",
          messages: messagesToExport,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка запроса экспорта");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ask-alex-dialog.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (caughtError) {
      setExportError(
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось экспортировать диалог",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(217,119,87,0.20),transparent_42%),radial-gradient(circle_at_82%_0%,rgba(226,196,156,0.28),transparent_36%),linear-gradient(180deg,var(--bg-000),var(--bg-0))]">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-bg-100 px-3 py-2 text-sm text-text-100 focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
      >
        Перейти к содержимому
      </a>

      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10"
      >
        <header className="mb-4 space-y-4 sm:mb-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-bg-100/90 p-1 shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
              <Image
                src="/alex-avatar.jpg"
                alt="Аватар Алекса"
                width={64}
                height={64}
                className="h-full w-full rounded-xl object-cover"
                priority
              />
            </div>

            <div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-100 sm:text-3xl">
                Ask Alex
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-text-300 sm:text-base">
                Чат о проектах, архитектурных решениях и delivery-опыте.
              </p>
            </div>
          </div>

          <nav aria-label="Быстрые ссылки" className="flex flex-wrap gap-2">
            <a
              href="https://viralmaxing.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-bg-100/85 px-3 text-sm font-medium text-text-300 shadow-sm ring-1 ring-bg-300/80 transition hover:text-text-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <Image
                src="/vm-logo.jpg"
                alt="Логотип Viralmaxing"
                width={16}
                height={16}
                className="rounded"
              />
              <span>Viralmaxing</span>
            </a>

            <a
              href="https://github.com/alexey-muzyka-1/ask-alex"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-bg-100/85 px-3 text-sm font-medium text-text-300 shadow-sm ring-1 ring-bg-300/80 transition hover:text-text-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <Code2 className="h-4 w-4" aria-hidden="true" />
              <span>Исходники GitHub</span>
            </a>
          </nav>
        </header>

        <section className="flex min-h-0 flex-1 flex-col rounded-[28px] bg-bg-100/88 shadow-[0_16px_38px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="min-h-0 flex-1 p-3 sm:p-4">
            <div className="h-full min-h-[52vh] overflow-hidden rounded-2xl bg-bg-0/80">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center bg-bg-200/45 px-4 py-6">
                  <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 text-center">
                    <div>
                      <p className="text-base font-medium text-text-200">
                        Начните с готового запроса
                      </p>
                      <p className="mt-1 text-sm text-text-400">
                        Спросите про проекты, инциденты, лидерство или цикл поставки.
                      </p>
                    </div>
                    <div className="mx-auto">
                      <StarterPrompts onSelect={onPromptSelect} disabled={isBusy} />
                    </div>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full p-3 sm:p-4">
                  <MessageList messages={messages} />
                </ScrollArea>
              )}
            </div>
          </div>

          <div className="border-t border-bg-300/70 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
            <ClaudeStyleChatInput
              onSendMessage={onSendFromComposer}
              disabled={isBusy}
              isSending={isBusy}
              onStop={isBusy ? () => stop() : undefined}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={messages.length === 0 || isExporting}
                  onClick={() => onExport(messages)}
                  className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-text-300 ring-1 ring-bg-300 transition hover:bg-bg-200/70 hover:text-text-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? (
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  Экспорт PDF чата
                </button>

                {error ? (
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-text-300 ring-1 ring-bg-300 transition hover:bg-bg-200/70 hover:text-text-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Повторить
                  </button>
                ) : null}

                {isBusy ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-text-300 ring-1 ring-bg-300 transition hover:bg-bg-200/70 hover:text-text-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    <Square className="h-3.5 w-3.5" aria-hidden="true" />
                    Остановить
                  </button>
                ) : null}
              </div>

              <p className="text-xs text-text-500">Статус: {status}</p>
            </div>

            {exportError ? (
              <p className="mt-2 text-xs text-destructive" role="status" aria-live="polite">
                {exportError}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
