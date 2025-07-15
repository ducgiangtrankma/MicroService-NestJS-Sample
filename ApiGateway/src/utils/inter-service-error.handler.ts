import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { InterServiceException } from 'src/exceptions/inter-service.exception';
import { randomUUID } from 'crypto';

export interface InterServiceCallOptions {
  serviceName: string;
  logger?: Logger;
  requestId?: string;
  context?: string;
}

/**
 * Wrapper function để thực hiện inter-service calls với error handling tổng quát
 */
export async function executeInterServiceCall<T>(
  axiosCall: () => Promise<T>,
  options: InterServiceCallOptions,
): Promise<T> {
  const { serviceName, logger, requestId = randomUUID(), context } = options;

  try {
    // Log request
    if (logger) {
      logger.log(
        `📤 Inter-service call started: ${serviceName}`,
        context || 'InterService',
      );
    }

    const startTime = Date.now();
    const result = await axiosCall();
    const duration = Date.now() - startTime;

    // Log success
    if (logger) {
      logger.log(
        `✅ Inter-service call completed: ${serviceName} (${duration}ms)`,
        context || 'InterService',
      );
    }

    return result;
  } catch (error) {
    const axiosError = error as AxiosError;
    const endpoint = axiosError.config?.url || 'unknown';
    const method = (axiosError.config?.method || 'unknown').toUpperCase();

    // Tạo InterServiceException với đầy đủ thông tin
    const interServiceError = new InterServiceException(
      serviceName,
      endpoint,
      method,
      axiosError,
      requestId,
    );

    // Log error với format chuẩn
    interServiceError.logError(logger, context);

    throw interServiceError;
  }
}

/**
 * Decorator để wrap inter-service methods với error handling
 */
export function InterServiceCall(serviceName: string, context?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger =
        this.logger || new Logger(context || target.constructor.name);
      const requestId = randomUUID();

      return executeInterServiceCall(() => method.apply(this, args), {
        serviceName,
        logger,
        requestId,
        context: context || target.constructor.name,
      });
    };

    return descriptor;
  };
}

/**
 * Helper function để extract error information từ axios error
 */
export function extractErrorInfo(error: AxiosError): {
  status: number;
  statusText: string;
  data: any;
  message: string;
  url: string;
  method: string;
  headers: any;
} {
  const errorData = error.response?.data as any;
  return {
    status: error.response?.status || 500,
    statusText: error.response?.statusText || 'Internal Server Error',
    data: errorData || null,
    message: errorData?.message || error.message || 'Unknown error',
    url: error.config?.url || 'unknown',
    method: (error.config?.method || 'unknown').toUpperCase(),
    headers: error.response?.headers || {},
  };
}

/**
 * Utility để tạo request ID unique
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Format log data cho hệ thống logging
 */
export function formatLogData(
  level: 'info' | 'error' | 'warn' | 'debug',
  service: string,
  endpoint: string,
  method: string,
  data: any,
  requestId?: string,
) {
  return {
    level,
    service,
    endpoint,
    method,
    timestamp: new Date().toISOString(),
    requestId,
    data,
  };
}
