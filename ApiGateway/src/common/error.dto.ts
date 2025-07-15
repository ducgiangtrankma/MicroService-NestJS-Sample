export class ErrorDto {
  timestamp: string;

  statusCode: number;

  error: string;

  errorCode?: string;

  message: string;

  stack?: string;

  trace?: Error | unknown;
}
