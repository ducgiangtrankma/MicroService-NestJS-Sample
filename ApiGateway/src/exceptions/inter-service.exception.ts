import { HttpException, HttpStatus } from '@nestjs/common';

export interface InterServiceErrorData {
  service: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  originalError?: any;
  timestamp: string;
  requestId?: string;
}

export class InterServiceException extends HttpException {
  public readonly serviceError: InterServiceErrorData;

  constructor(
    service: string,
    endpoint: string,
    method: string,
    originalError: any,
    requestId?: string,
  ) {
    const statusCode =
      originalError?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      originalError?.response?.data?.message ||
      originalError?.message ||
      'Inter-service communication failed';

    const serviceError: InterServiceErrorData = {
      service,
      endpoint,
      method,
      statusCode,
      message,
      originalError: originalError?.response?.data || originalError?.message,
      timestamp: new Date().toISOString(),
      requestId,
    };

    // Sử dụng status code từ service con
    super(
      {
        statusCode,
        message,
        service,
        endpoint,
        method,
        timestamp: serviceError.timestamp,
        requestId,
        details: originalError?.response?.data || null,
      },
      statusCode,
    );

    this.serviceError = serviceError;
  }

  /**
   * Log error với format chuẩn cho hệ thống log
   */
  logError(logger: any, context?: string) {
    const logData = {
      level: 'error',
      context: context || 'InterService',
      service: this.serviceError.service,
      endpoint: this.serviceError.endpoint,
      method: this.serviceError.method,
      statusCode: this.serviceError.statusCode,
      message: this.serviceError.message,
      timestamp: this.serviceError.timestamp,
      requestId: this.serviceError.requestId,
      originalError: this.serviceError.originalError,
    };
    console.log('Internal request Error', {
      service: logData.service,
      message: logData.message,
    });
  }
}
