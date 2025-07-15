import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import { type Response } from 'express';
import { STATUS_CODES } from 'http';
import { I18nService } from 'nestjs-i18n';
import { ErrorDto } from 'src/common/error.dto';
import { AppConfig } from 'src/config/app-config.type';
import { AllConfigType } from 'src/config/config.type';
import { ErrorMessages } from 'src/constants/error-key.constant';
import { ValidationException } from 'src/exceptions/validation.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private debug: boolean = false;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    this.debug = this.configService.getOrThrow<AppConfig>('app').debugMode;

    let error: ErrorDto;

    if (exception instanceof ValidationException) {
      error = this.handleValidationException(exception);
    } else if (exception instanceof HttpException) {
      error = this.handleHttpException(exception);
    } else {
      error = this.handleError(exception);
    }
    if (this.debug) {
      error.stack = exception.stack;
      error.trace = exception;
    }
    response.status(error.statusCode).json(error);
  }

  /**
   * Handles generic errors
   * @param error Error
   * @returns ErrorDto
   */
  private handleError(error: Error): ErrorDto {
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      message: error?.message || 'An unexpected error occurred',
    };

    return errorRes;
  }

  /**
   * Handles HttpException
   * @param exception HttpException
   * @returns ErrorDto
   */
  private handleHttpException(exception: HttpException): ErrorDto {
    const statusCode = exception.getStatus();
    const errorResponse = exception.getResponse();
    const messageKey = errorResponse['message'] || 'errors.genericError';
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      message: this.i18n.t(messageKey),
    };

    return errorRes;
  }

  /**
   * Handles validation errors
   * @param exception ValidationException
   * @returns ErrorDto
   */
  private handleValidationException(exception: ValidationException): ErrorDto {
    const statusCode = exception.getStatus();

    const errorResponse = exception.getResponse() as Record<string, any>;

    let messages: string[] = [];

    // Kiểm tra nếu errorCode là một mảng chứa ValidationError[]
    if (Array.isArray(errorResponse.errorCode)) {
      messages = errorResponse.errorCode.map((error: ValidationError) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      });
    }

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      errorCode: messages.length ? messages.join(', ') : '',
      message: this.i18n.t(ErrorMessages.Valid_Filed),
    };
    return errorRes;
  }
}
