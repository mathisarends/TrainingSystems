import winston, { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; // Importiere DailyRotateFile

const { combine, timestamp, printf } = format;

// Definiere das Log-Format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const fileRotateTransport = new DailyRotateFile({
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  dirname: './logs',
  zippedArchive: true
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    fileRotateTransport,
    new winston.transports.File({
      filename: './logs/app-error.log',
      level: 'error'
    })
  ],
  exceptionHandlers: [new winston.transports.File({ filename: './logs/exception.log' })],
  rejectionHandlers: [new winston.transports.File({ filename: './logs/rejections.log' })]
});

export default logger;
