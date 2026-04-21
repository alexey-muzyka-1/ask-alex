import { tavily } from "@tavily/core";

import { getEnv } from "@/src/shared/env";

export async function runTavilySearch(query: string): Promise<unknown> {
  const env = getEnv();
  const client = tavily({ apiKey: env.TAVILY_API_KEY });

  return client.search(query, {
    max_results: 5,
    include_answer: false,
    include_images: false,
  });
}
