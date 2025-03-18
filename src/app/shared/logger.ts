/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, label, printf } = format;

// Custom log
const myFormat = printf(({ level, message, label, timestamp }: any) => {
  const date = new Date(timestamp);
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  return `${date.toDateString()} ${h}:${m} ${s} [${label}] ${level}: ${message}`;
});

const logDir = path.join(process.cwd(), "logs", "winston");

export const logger = createLogger({
  level: "info",
  format: combine(label({ label: "Example app" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      level: "info",
      filename: path.join(logDir, "successes", "um-success.log"),
    }),

    new DailyRotateFile({
      level: "info",
      filename: path.join(logDir, "successes", "um-%DATE%-success.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export const errorLogger = createLogger({
  level: "error",
  format: combine(label({ label: "Example app" }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      level: "error",
      filename: path.join(logDir, "errors", "um-%DATE%-error.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
