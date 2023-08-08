import winston = require('winston');
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { DateUtils } from './date-utils';

export class Logger {
  static createLogger(
    className: string,
    path = './logs',
    fileName = 'stdout',
  ): winston.Logger {
    const { format } = winston;
    const { combine, timestamp, label, printf } = format;

    const logFormat = printf((info) => {
      if (typeof info.message === 'object') {
        info.message = JSON.stringify(info.message);
      }
      return `${DateUtils.formatDate(new Date(info.timestamp))} [${info.label}${
        info.tag ? `<${info.tag}>` : ''
      }] ${info.level}: ${info.message} ${!!info.stack ? info.stack : ''}`;
    });

    const logger = winston.createLogger({
      transports: [
        new DailyRotateFile({
          level: 'info',
          filename: `${path}/${fileName}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '14d',
        }),
      ],
      format: combine(label({ label: className }), timestamp(), logFormat),
    });
    // if (process.env.RUNNING_ENV !== 'PROD') {
    logger.add(new winston.transports.Console());
    // }
    return logger;
  }
}
