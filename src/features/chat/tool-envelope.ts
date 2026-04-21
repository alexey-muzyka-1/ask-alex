import { failure, success, type Result } from "@/src/shared/result";

export type ToolEnvelope<T> = Result<T>;

export function toolSuccess<T>(data: T): ToolEnvelope<T> {
  return success(data);
}

export function toolFailure(
  code: string,
  message: string,
  retryable = false,
): ToolEnvelope<never> {
  return failure(code, message, retryable);
}
