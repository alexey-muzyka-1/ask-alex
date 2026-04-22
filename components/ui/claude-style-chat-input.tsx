"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUp, Loader2 } from "lucide-react";

export type ClaudeChatInputSubmit = {
  message: string;
};

type ClaudeChatInputProps = {
  onSendMessage: (data: ClaudeChatInputSubmit) => Promise<void> | void;
  disabled?: boolean;
  isSending?: boolean;
  onStop?: () => void;
};

export default function ClaudeStyleChatInput({
  onSendMessage,
  disabled,
  isSending,
  onStop,
}: ClaudeChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      260,
    )}px`;
  }, [message]);

  async function handleSend() {
    if (disabled || isSending) {
      return;
    }

    const text = message.trim();
    if (!text) {
      return;
    }

    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage({ message: text });
    } catch {
      // Restore user input if request fails before chat state captures it.
      setMessage(text);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-bg-300/90 bg-bg-100/95 p-3 shadow-input transition-all duration-200 hover:shadow-input-hover focus-within:shadow-input-focus">
        <label htmlFor="chat-input" className="sr-only">
          Сообщение
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Обсудить резюме Алекса, проекты, архитектурные решения…"
          className="custom-scrollbar min-h-11 w-full resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-base leading-relaxed text-text-100 outline-none placeholder:text-text-400"
          rows={1}
          disabled={disabled}
          spellCheck={false}
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        />

        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          <p className="text-xs text-text-500">Ctrl/Cmd + Enter отправляет сообщение</p>

          <div className="flex items-center gap-2">
            {isSending && onStop ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex min-h-10 items-center rounded-xl border border-bg-300 bg-bg-0 px-3 text-sm font-medium text-text-300 transition hover:bg-bg-200 hover:text-text-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                Остановить
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
              disabled={disabled || Boolean(isSending) || message.trim().length === 0}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-bg-0 shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:bg-accent/40"
              aria-label="Отправить сообщение"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              )}
              <span>Отправить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
