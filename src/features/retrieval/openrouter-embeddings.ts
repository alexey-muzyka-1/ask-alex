import { createHash } from "node:crypto";

import {
  DEFAULT_OPENROUTER_EMBEDDING_MODEL,
  VECTOR_DIMENSION,
} from "@/src/shared/constants";
import type { EmbeddingProvider } from "@/src/features/retrieval/embedding-provider";

type OpenRouterEmbeddingsProviderOptions = {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
};

type OpenRouterEmbeddingsResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
};

const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";

export class OpenRouterEmbeddingsProvider implements EmbeddingProvider {
  private readonly apiKey: string | null;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: OpenRouterEmbeddingsProviderOptions = {}) {
    this.apiKey = options.apiKey?.trim() ? options.apiKey : null;
    this.model = options.model ?? DEFAULT_OPENROUTER_EMBEDDING_MODEL;
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  async embed(text: string): Promise<number[]> {
    if (this.apiKey) {
      try {
        const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            input: text,
          }),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter embeddings failed: ${response.status}`);
        }

        const json = (await response.json()) as OpenRouterEmbeddingsResponse;
        const embedding = json.data?.[0]?.embedding;

        if (Array.isArray(embedding) && embedding.length > 0) {
          return compressVector(embedding, VECTOR_DIMENSION);
        }
      } catch {
        // Fall back to deterministic local embeddings so search still works.
      }
    }

    return deterministicEmbedding(text, VECTOR_DIMENSION);
  }
}

export function deterministicEmbedding(text: string, dimension: number): number[] {
  const hash = createHash("sha256").update(text).digest();
  const vector = Array.from({ length: dimension }, (_, index) => {
    const byte = hash[index % hash.length] ?? 0;
    return byte / 127.5 - 1;
  });

  return normalizeVector(vector);
}

function compressVector(vector: number[], dimension: number): number[] {
  if (vector.length === 0) {
    return deterministicEmbedding("", dimension);
  }

  if (vector.length === dimension) {
    return normalizeVector(vector);
  }

  const compressed = new Array<number>(dimension).fill(0);

  for (let index = 0; index < vector.length; index += 1) {
    const value = vector[index] ?? 0;
    compressed[index % dimension] += Number.isFinite(value) ? value : 0;
  }

  return normalizeVector(compressed);
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}
