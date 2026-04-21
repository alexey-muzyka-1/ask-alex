import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";

export function createRequestId(): string {
  return randomUUID();
}

export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
  requestId?: string,
): Promise<T> {
  const startedAt = performance.now();

  try {
    return await fn();
  } finally {
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    logInfo(`${label}.duration_ms=${durationMs}`, requestId);
  }
}

export function logInfo(message: string, requestId?: string): void {
  if (requestId) {
    console.log(`[${requestId}] ${message}`);
    return;
  }

  console.log(message);
}

export function logError(message: string, requestId?: string): void {
  if (requestId) {
    console.error(`[${requestId}] ${message}`);
    return;
  }

  console.error(message);
}
