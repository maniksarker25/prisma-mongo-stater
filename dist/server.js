"use strict";
// import { Server } from "http";
// import app from "./app";
// import config from "./app/config";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const logger_1 = require("./app/utils/logger");
// import socket from './app/socket/socket';
// some changes--------
process.on("uncaughtException", (error) => {
    logger_1.errorLogger.error("Uncaught Exception:", error);
    process.exit(1);
});
let myServer;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const port = typeof config_1.default.port === "number" ? config_1.default.port : Number(config_1.default.port);
            myServer = app_1.default.listen(port, config_1.default.base_url, () => {
                logger_1.logger.info(`Example app listening on port http://${config_1.default.base_url}:${config_1.default.port}`);
            });
            // Set up Socket.IO-----------------
            // const socketIO = new Server(myServer, {
            //   pingTimeout: 60000,
            //   cors: {
            //     origin: '*',
            //   },
            // });
            // socket(socketIO);
            // Initialize Socket.IO
            // initializeSocket(myServer);
        }
        catch (error) {
            logger_1.errorLogger.error("Error in main function:", error);
            throw error;
        }
        process.on("unhandledRejection", (error) => {
            if (myServer) {
                myServer.close(() => {
                    logger_1.errorLogger.error("Unhandled Rejection:", error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
main().catch((err) => logger_1.errorLogger.error("Main function error:", err));
process.on("SIGTERM", () => {
    logger_1.logger.info("SIGTERM signal received");
    if (myServer) {
        myServer.close(() => {
            logger_1.logger.info("Server closed gracefully");
        });
    }
});
