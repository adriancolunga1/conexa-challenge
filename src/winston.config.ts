import { WinstonModuleOptions } from 'nest-winston';
import { format, transports, config } from 'winston';

const { combine, timestamp, errors, json } = format;

export const winstonConfig: WinstonModuleOptions = {
  levels: config.npm.levels,
  level: 'info',
  format: combine(
    errors({ stack: false }),
    timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      level: 'info',
      filename: 'info.log',
      dirname: 'logs',
    }),
    new transports.File({
      level: 'error',
      filename: 'errors.log',
      dirname: 'logs',
    }),
  ],
};
