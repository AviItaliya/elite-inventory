import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import prisma from "./config/prisma.js";
import { startCron, stopCron } from "./cron/emailCron.js";
import logger from "./utils/logger.js";
import type { Server } from "node:http";

const PORT = Number(process.env.PORT) || 1213;

let server: Server | undefined;
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info("Shutdown started", { signal });

  stopCron();

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);

  forceExit.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await prisma.$disconnect();

    logger.info("Application shutdown completed");
    process.exitCode = 0;
  } catch (error) {
    logger.error("Application shutdown failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    process.exitCode = 1;
  } finally {
    clearTimeout(forceExit);
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

async function startServer(): Promise<void> {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info("HTTP server started", { port: PORT });
      startCron();
    });

    server.on("error", (error) => {
      logger.error("HTTP server error", {
        errorName: error.name,
      });
      process.exitCode = 1;
    });
  } catch (error) {
    logger.error("Application startup failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    await prisma.$disconnect().catch(() => undefined);
    process.exitCode = 1;
  }
}

void startServer();