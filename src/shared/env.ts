import { z } from "zod";

import {
  DEFAULT_OPENROUTER_EMBEDDING_MODEL,
  DEFAULT_OPENROUTER_MODEL,
} from "@/src/shared/constants";

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default(DEFAULT_OPENROUTER_MODEL),
  OPENROUTER_EMBEDDING_MODEL: z
    .string()
    .default(DEFAULT_OPENROUTER_EMBEDDING_MODEL),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    OPENROUTER_EMBEDDING_MODEL: process.env.OPENROUTER_EMBEDDING_MODEL,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Environment validation failed: ${message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
