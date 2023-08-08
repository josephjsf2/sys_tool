import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import winston, { startTimer } from 'winston';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { MeasureTimeInterceptor } from './common/interceptors/measure-time.interceptor';
import { Logger } from './common/utils/logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger: winston.Logger = Logger.createLogger('stderr');
  // app.enableVersioning({ type: VersioningType.HEADER, header: 'api-version' });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalInterceptors(new MeasureTimeInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  // pug setting
  app.useStaticAssets(join(__dirname, '..', 'assets'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('pug');

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Error: ', err);
  });

  const configService = app.get(ConfigService);

  const port = configService.get('port');

  await app.listen(port || 3000);
}
bootstrap();
