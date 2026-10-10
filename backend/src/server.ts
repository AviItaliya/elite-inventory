import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startCron } from "./cron/emailCron.js";

const PORT = Number(process.env.PORT) || 1213;

async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
      startCron();
    });
  } catch (error) {
    console.error("Express server startup failed:", error);
    process.exitCode = 1;
  }
}

void startServer();