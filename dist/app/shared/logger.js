"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.logger = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, label, printf } = winston_1.format;
// Custom log
const myFormat = printf(({ level, message, label, timestamp }) => {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${date.toDateString()} ${h}:${m} ${s} [${label}] ${level}: ${message}`;
});
const logDir = path_1.default.join(process.cwd(), "logs", "winston");
exports.logger = (0, winston_1.createLogger)({
    level: "info",
    format: combine(label({ label: "Food Delivery" }), timestamp(), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({
            level: "info",
            filename: path_1.default.join(logDir, "successes", "um-success.log"),
        }),
        new winston_daily_rotate_file_1.default({
            level: "info",
            filename: path_1.default.join(logDir, "successes", "um-%DATE%-success.log"),
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});
exports.errorLogger = (0, winston_1.createLogger)({
    level: "error",
    format: combine(label({ label: "Food Delivery" }), timestamp(), myFormat),
    transports: [
        new winston_1.transports.Console(),
        new winston_daily_rotate_file_1.default({
            level: "error",
            filename: path_1.default.join(logDir, "errors", "um-%DATE%-error.log"),
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});
