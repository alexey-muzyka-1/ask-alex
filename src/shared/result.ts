export type AppErrorPayload = {
  code: string;
  message: string;
  retryable: boolean;
};

export type SuccessResult<T> = {
  ok: true;
  data: T;
};

export type FailureResult = {
  ok: false;
  error: AppErrorPayload;
};

export type Result<T> = SuccessResult<T> | FailureResult;

export function success<T>(data: T): SuccessResult<T> {
  return { ok: true, data };
}

export function failure(
  code: string,
  message: string,
  retryable = false,
): FailureResult {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable,
    },
  };
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}
