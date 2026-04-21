import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";

export async function mapToModelMessages(
  messages: UIMessage[],
): Promise<ModelMessage[]> {
  return convertToModelMessages(messages);
}
