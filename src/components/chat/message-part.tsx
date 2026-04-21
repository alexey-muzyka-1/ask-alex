import { SourceList } from "@/src/components/chat/source-list";
import { ToolState } from "@/src/components/chat/tool-state";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isToolPart(part: unknown): part is {
  type: string;
  state?: string;
  output?: unknown;
  errorText?: string;
} {
  return isRecord(part) && typeof part.type === "string" && part.type.startsWith("tool-");
}

export function MessagePart({ part }: { part: unknown }) {
  if (!isRecord(part)) {
    return null;
  }

  if (part.type === "text") {
    return <p className="whitespace-pre-wrap leading-relaxed">{String(part.text ?? "")}</p>;
  }

  if (isToolPart(part)) {
    const output = isRecord(part.output) ? part.output : null;
    const result = output && "ok" in output ? (output as { ok: boolean; data?: unknown }) : null;

    const hits =
      part.type === "tool-search_candidate" &&
      result?.ok &&
      isRecord(result.data) &&
      Array.isArray(result.data.hits)
        ? (result.data.hits as Array<{
            chunkId: string;
            source: string;
            excerpt: string;
            score: number;
          }>)
        : [];

    return (
      <div className="rounded-md border border-border bg-background/70 p-2">
        <ToolState part={part} />
        <SourceList hits={hits} />
      </div>
    );
  }

  return null;
}
