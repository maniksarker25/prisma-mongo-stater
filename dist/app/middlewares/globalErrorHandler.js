"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const appError_1 = __importDefault(require("../errors/appError"));
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const handleClientError_1 = __importDefault(require("../errors/handleClientError"));
// const globalErrorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//     success: false,
//     message: err.message || "Something went wrong",
//     error: err,
//   });
// };
const globalErrorHandler = (error, req, res, next) => {
    config_1.default.env === "development"
        ? console.log(`🐱‍🏍 globalErrorHandler ~~`, { error })
        : logger_1.errorlogger.error(`🐱‍🏍 globalErrorHandler ~~`, error);
    let statusCode = 500;
    let message = "Something went wrong !";
    let errorMessages = [];
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const simplifiedError = (0, handleClientError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof appError_1.default) {
        statusCode = error === null || error === void 0 ? void 0 : error.statusCode;
        message = error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    else if (error instanceof Error) {
        message = error === null || error === void 0 ? void 0 : error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config_1.default.env !== "production" ? error === null || error === void 0 ? void 0 : error.stack : undefined,
    });
};
exports.default = globalErrorHandler;
