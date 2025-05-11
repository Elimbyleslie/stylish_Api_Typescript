export class ErrorResponse extends Error {
  statusCode: number;
  error: string | undefined;

  constructor(status: number, message: string, error?: string) {
    super(message);
    this.statusCode = status;
    this.error = error;
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
