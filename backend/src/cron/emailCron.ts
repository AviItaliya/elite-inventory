import cron from "node-cron";
import emailService from "../services/emailService.js";
import logger from "../utils/logger.js";

type ScheduledTask = ReturnType<typeof cron.schedule>;
const tasks: ScheduledTask[] = [];

export const startCron = (): void => {
  if (tasks.length > 0) {
    logger.warn("Cron jobs are already registered");
    return;
  }

  const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";

  const registerJob = (name: string, schedule: string, job: () => Promise<unknown>): void => {
    const task = cron.schedule(schedule,
      async () => {
        logger.info("Cron job started", { job: name });

        try {
          await job();
          logger.info("Cron job completed", { job: name });
        } catch (error) {
          logger.error("Cron job failed", {
            job: name,
            errorName:
              error instanceof Error ? error.name : "UnknownError",
          });
        }
      },
      {
        timezone,
        noOverlap: true,
      },
    );

    tasks.push(task);
  };

  registerJob("daily-inventory-summary", "0 9 * * *", 
    () => emailService.sendDailyInventorySummary(),
  );

  registerJob("low-stock-alert", "15 9 * * *",
    () => emailService.sendLowerStockAlert(),
  );

  registerJob("weekly-inventory-report", "0 9 * * 1",
    () => emailService.sendWeeklyInventoryReport(),
  );

  logger.info("Cron jobs registered", {
    timezone,
    jobCount: tasks.length,
  });
};

export const stopCron = (): void => {
  for (const task of tasks) {
    task.stop();
  }

  tasks.length = 0;
  logger.info("Cron jobs stopped");
};
