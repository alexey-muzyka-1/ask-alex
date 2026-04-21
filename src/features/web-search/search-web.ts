import { failure, success, toErrorMessage, type Result } from "@/src/shared/result";
import { normalizeWebResults } from "@/src/features/web-search/normalize-web-results";
import { runTavilySearch } from "@/src/features/web-search/tavily-client";
import type { WebSearchOutput } from "@/src/features/web-search/web-search.types";

export async function searchWeb(query: string): Promise<Result<WebSearchOutput>> {
  try {
    const rawResponse = await runTavilySearch(query);
    const output = normalizeWebResults(rawResponse as { results?: unknown[] });

    return success(output);
  } catch (error) {
    return failure("WEB_SEARCH_FAILED", toErrorMessage(error), true);
  }
}
