export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    statusCode = 500,
    retryable = false,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
