import { Logger } from '../utils/logger';
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { SysResponseMsg } from 'src/common/models/sys-response-msg.model';
import { SysCode } from 'src/common/enum/sys-code.enum';
import winston from 'winston';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  logger: winston.Logger = Logger.createLogger(GlobalExceptionFilter.name);

  catch(error: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let respMsg: SysResponseMsg;
    if (error instanceof HttpException) {
      if (error.getStatus() === 404) {
        this.logger.error((error as any).response?.message);
        respMsg = new SysResponseMsg(SysCode.PATH_NOT_FOUND, '非合法路徑');
        response.status(HttpStatus.NOT_FOUND);
      } else if (error.getStatus() === 400) {
        try {
          this.logger.error(error['response']?.message);
          respMsg = new SysResponseMsg(
            SysCode.BAD_REQUEST,
            (error as any).response.message[0],
          );
          response.status(HttpStatus.BAD_REQUEST);
        } catch (innerErr) {
          this.logger.error(innerErr);
        }
      }
    }
    if (!respMsg) {
      this.logger.error(error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      if (error.stack) {
        this.logger.error(error.stack);
      }
    }
    response.json(
      respMsg || new SysResponseMsg(SysCode.UNKNOWN_ERROR, '未知錯誤'),
    );
  }
}
