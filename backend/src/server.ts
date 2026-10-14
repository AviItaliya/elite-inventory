<<<<<<< HEAD
import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startCron } from "./cron/emailCron.js";
import { initializeSocket } from "./config/socket.js";

const PORT = Number(process.env.PORT) || 1213;
async function startServer(): Promise<void> {
  try {
    await connectDB();
    const httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Express + Socket.IO server running on http://localhost:${PORT}`);
      startCron();
    });
  } catch (error) {
    console.error("Express server startup failed:", error);
    process.exitCode = 1;
  }
}
void startServer();
=======
import app from "./app.js";
import { connectDB } from "./config/db.js";
import "dotenv/config";
import { startCron } from "./cron/emailCron.js";

const PORT = process.env.PORT || 1213;
async function startServer(): Promise<void> {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            startCron();
        });
        server.on("error", (error: Error) => {
            console.error("HTTP server failed to start:", error);
            process.exitCode = 1;
        });
    } catch (error) {
        console.error("Application startup failed:", error);
        process.exitCode = 1;
    }
}
void startServer();
>>>>>>> origin/main
