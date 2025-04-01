import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { HttpExceptionResponse } from '../interfaces';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {
    super();
  }

  catch(exception: any, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response: HttpExceptionResponse = {
      status,
      message: exception.response ? exception.response.message : exception,
      path: req.url,
      method: req.method,
    };

    this.logger.error(response);
    res.status(status).json(response);
  }
}
