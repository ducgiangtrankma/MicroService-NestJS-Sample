import { HttpStatus } from '@nestjs/common';
import { ApplicationApiResponse } from './api.response.interface';

export class ResponseHelper {
  static success<T>(
    data: T,
    message = 'Success',
    statusCode = HttpStatus.OK,
  ): ApplicationApiResponse<T> {
    return {
      statusCode,
      message,
      data,
    };
  }

  static error(
    message: string,
    error: any = null,
    statusCode = HttpStatus.BAD_REQUEST,
  ): ApplicationApiResponse<null> {
    return {
      statusCode,
      message,
      error,
    };
  }
}
