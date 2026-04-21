import { z } from "zod";
import type { UIMessage } from "ai";

import { streamChatResponse } from "@/src/features/chat/chat-service";
import {
  createRequestId,
  logError,
  logInfo,
  measureAsync,
} from "@/src/shared/observability";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
});

export async function POST(request: Request): Promise<Response> {
  const requestId = createRequestId();

  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      logError(`Invalid /api/chat payload: ${parsed.error.message}`, requestId);
      return Response.json(
        {
          error: "Invalid request payload",
        },
        { status: 400 },
      );
    }

    const result = await measureAsync(
      "chat.stream",
      async () => streamChatResponse(parsed.data.messages, requestId),
      requestId,
    );

    return result.toUIMessageStreamResponse({
      onFinish: async () => {
        logInfo("chat.stream.finished", requestId);
      },
    });
  } catch (error) {
    logError(`Chat request failed: ${error instanceof Error ? error.message : "unknown"}`, requestId);

    return Response.json(
      {
        error: "Unable to process chat request",
      },
      { status: 500 },
    );
  }
}
