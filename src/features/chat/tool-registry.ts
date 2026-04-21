import { z } from "zod";
import { tool } from "ai";

import { getEnv } from "@/src/shared/env";
import { measureAsync } from "@/src/shared/observability";
import { toErrorMessage } from "@/src/shared/result";
import { searchCandidate } from "@/src/features/retrieval/search-candidate";
import { OpenAIEmbeddingsProvider } from "@/src/features/retrieval/openai-embeddings";
import { getProject } from "@/src/features/projects/get-project";
import { searchWeb } from "@/src/features/web-search/search-web";
import {
  toolFailure,
  toolSuccess,
  type ToolEnvelope,
} from "@/src/features/chat/tool-envelope";

type ToolRegistryContext = {
  requestId: string;
};

type SearchCandidateOutput = {
  hits: Array<{
    chunkId: string;
    source: string;
    excerpt: string;
    score: number;
  }>;
};

type GetProjectOutput = {
  name: string;
  role: string;
  cycleTime: string;
  handoff: string;
  description: string;
  links: Array<{ label: string; url: string }>;
};

type SearchWebOutput = {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    score?: number;
  }>;
};

export function createToolRegistry({ requestId }: ToolRegistryContext) {
  const env = getEnv();
  const embeddingProvider = new OpenAIEmbeddingsProvider({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_EMBEDDING_MODEL,
  });

  return {
    search_candidate: tool({
      description:
        "Search in Alex's internal profile corpus and return the best matching source chunks.",
      inputSchema: z.object({
        query: z.string().min(2),
      }),
      execute: async ({ query }): Promise<ToolEnvelope<SearchCandidateOutput>> =>
        measureAsync(
          "tool.search_candidate",
          async () => {
            try {
              const hits = await searchCandidate({
                provider: embeddingProvider,
                query,
              });

              return toolSuccess({ hits });
            } catch (error) {
              return toolFailure(
                "SEARCH_CANDIDATE_FAILED",
                toErrorMessage(error),
                true,
              );
            }
          },
          requestId,
        ),
    }),

    get_project: tool({
      description:
        "Get structured details for a known project: viralmaxing, casino, ditto-music, hikemyskill, telegram-bots, agency-admin.",
      inputSchema: z.object({
        name: z.string().min(1),
      }),
      execute: async ({ name }): Promise<ToolEnvelope<GetProjectOutput>> =>
        measureAsync(
          "tool.get_project",
          async () => {
            const result = getProject(name);

            if (!result.ok) {
              return toolFailure(
                result.error.code,
                result.error.message,
                result.error.retryable,
              );
            }

            return toolSuccess(result.data);
          },
          requestId,
        ),
    }),

    search_web: tool({
      description:
        "Search the public web for external context. Use this only as secondary augmentation.",
      inputSchema: z.object({
        query: z.string().min(2),
      }),
      execute: async ({ query }): Promise<ToolEnvelope<SearchWebOutput>> =>
        measureAsync(
          "tool.search_web",
          async () => {
            const result = await searchWeb(query);

            if (!result.ok) {
              return toolFailure(
                result.error.code,
                result.error.message,
                result.error.retryable,
              );
            }

            return toolSuccess(result.data);
          },
          requestId,
        ),
    }),
  };
}
