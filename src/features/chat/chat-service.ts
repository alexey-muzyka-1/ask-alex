import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { stepCountIs, streamText, type UIMessage } from "ai";

import { MAX_TOOL_STEPS } from "@/src/shared/constants";
import { getEnv } from "@/src/shared/env";
import { createToolRegistry } from "@/src/features/chat/tool-registry";
import { mapToModelMessages } from "@/src/features/chat/message-mapper";
import { SYSTEM_PROMPT } from "@/src/features/chat/system-prompt";

export async function streamChatResponse(
  messages: UIMessage[],
  requestId: string,
) {
  const env = getEnv();

  const openrouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
  });
  const model = openrouter(env.OPENROUTER_MODEL, {
    maxTokens: env.OPENROUTER_MAX_OUTPUT_TOKENS,
  });

  const modelMessages = await mapToModelMessages(messages);
  const tools = createToolRegistry({ requestId });

  return streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    maxOutputTokens: env.OPENROUTER_MAX_OUTPUT_TOKENS,
    tools,
    stopWhen: stepCountIs(MAX_TOOL_STEPS),
  });
}
