import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startCron } from "./cron/emailCron.js";
import { initializeSocket } from "./config/socket.js";
import { firebaseMessaging } from "./config/firebaseAdmin.js";

const PORT = Number(process.env.PORT) || 1213;
async function startServer(): Promise<void> {
  try {
    await connectDB();
    const httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Express + Socket.IO server running on http://localhost:${PORT}`);
      console.log("Firebase Admin initialized:", Boolean(firebaseMessaging));
      startCron();
    });
  } catch (error) {
    console.error("Express server startup failed:", error);
    process.exitCode = 1;
  }
}
void startServer();
