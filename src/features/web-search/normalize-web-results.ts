import type { WebSearchOutput, WebSearchResultItem } from "@/src/features/web-search/web-search.types";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  results?: unknown[];
};

export function normalizeWebResults(input: TavilyResponse): WebSearchOutput {
  const results = (input.results ?? [])
    .filter(isTavilyResult)
    .filter((result) => result.url)
    .map<WebSearchResultItem>((result) => ({
      title: result.title?.trim() || "Untitled",
      url: result.url!.trim(),
      snippet: (result.content ?? "").trim().slice(0, 320),
      score: typeof result.score === "number" ? Number(result.score.toFixed(4)) : undefined,
    }));

  return { results };
}

function isTavilyResult(value: unknown): value is TavilyResult {
  return Boolean(value) && typeof value === "object";
}
