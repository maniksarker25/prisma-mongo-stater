// import { Server } from "http";
// import app from "./app";
// import config from "./app/config";

// const main = async () => {
//   let server: Server;
//   server = app.listen(config.port, () => {
//     console.log(`Ms Health Care Server listening on port ${config.port}`);
//   });

//   const exitHandler = () => {
//     if (server) {
//       server.close(() => {
//         console.info("Server closed");
//       });
//     }
//     process.exit(1);
//   };

//   process.on("uncaughtException", (error) => {
//     console.log(error);
//     exitHandler();
//   });

//   // handle unhandled rejection error
//   process.on("unhandledRejection", (error) => {
//     console.log(error);
//     exitHandler();
//   });
// };
// main();

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import { Server as HTTPServer } from "http"; // Import HTTPServer type
import server from "./app";
import config from "./app/config";
import { errorLogger, logger } from "./app/utils/logger";
// import socket from './app/socket/socket';
// some changes--------
process.on("uncaughtException", (error) => {
  errorLogger.error("Uncaught Exception:", error);
  process.exit(1);
});

let myServer: HTTPServer | undefined;

async function main() {
  try {
    const port =
      typeof config.port === "number" ? config.port : Number(config.port);
    myServer = server.listen(port, config.base_url as string, () => {
      logger.info(
        `Example app listening on port http://${config.base_url}:${config.port}`
      );
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
  } catch (error) {
    errorLogger.error("Error in main function:", error);
    throw error;
  }

  process.on("unhandledRejection", (error) => {
    if (myServer) {
      myServer.close(() => {
        errorLogger.error("Unhandled Rejection:", error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main().catch((err) => errorLogger.error("Main function error:", err));

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received");
  if (myServer) {
    myServer.close(() => {
      logger.info("Server closed gracefully");
    });
  }
});
