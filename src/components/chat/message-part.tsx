import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ToolState } from "@/src/components/chat/tool-state";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isToolPart(part: unknown): part is {
  type: string;
  state?: string;
  errorText?: string;
} {
  return isRecord(part) && typeof part.type === "string" && part.type.startsWith("tool-");
}

function MarkdownText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
        ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
        ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
        li: (props) => <li className="leading-relaxed" {...props} />,
        pre: (props) => (
          <pre className="mb-2 overflow-x-auto rounded-lg bg-bg-200 p-3 text-[0.92em] last:mb-0" {...props} />
        ),
        code: ({ className, ...props }) => (
          <code className={`rounded bg-bg-200 px-1 py-0.5 text-[0.92em] ${className ?? ""}`} {...props} />
        ),
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function MessagePart({ part }: { part: unknown }) {
  if (!isRecord(part)) {
    return null;
  }

  if (part.type === "text") {
    return (
      <div className="text-text-200">
        <MarkdownText text={String(part.text ?? "")} />
      </div>
    );
  }

  if (isToolPart(part)) {
    return <ToolState part={part} />;
  }

  return null;
}
