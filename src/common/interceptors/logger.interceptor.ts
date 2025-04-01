import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.log(context.switchToHttp().getRequest());
    return next.handle();
  }

  private log(req: Request): void {
    const body = { ...req.body };
    delete body.password;

    this.logger.info({
      method: req.method,
      action: req.res.statusCode,
      route: req.route.path,
      data: {
        body,
        query: req.query,
        params: req.params,
      },
    });
  }
}
