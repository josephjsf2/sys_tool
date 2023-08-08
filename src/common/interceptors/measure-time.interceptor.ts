import { Logger } from './../utils/logger';
import { NestInterceptor } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { tap } from 'rxjs/operators';
import winston from 'winston';

export class MeasureTimeInterceptor implements NestInterceptor {
  logger: winston.Logger = Logger.createLogger(MeasureTimeInterceptor.name);

  intercept(
    context: import('@nestjs/common').ExecutionContext,
    next: import('@nestjs/common').CallHandler<any>,
  ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
    const startTime = performance.now();
    const reqUrl = context.switchToHttp().getRequest().url;

    return next.handle().pipe(
      tap((_) => {
        const endTime = performance.now();
        const execTime = endTime - startTime;
        if (execTime > 1000) {
          this.logger.warn(
            `It took ${execTime} ms to proceed url ${reqUrl} request.`,
          );
        }
      }),
    );
  }
}
