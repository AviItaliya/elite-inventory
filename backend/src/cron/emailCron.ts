import cron from "node-cron";
import emailService from "../services/emailService.js";

<<<<<<< HEAD
type ScheduledTask = ReturnType<typeof cron.schedule>;

const tasks: ScheduledTask[] = [];
const runningJobs = new Set<string>();

export function startCron(): void {
  if (process.env.ENABLE_EMAIL_CRON !== "true") {
    console.log("Email cron jobs are disabled.");
    return;
  }

  if (tasks.length > 0) {
    console.warn("Email cron jobs are already registered.");
    return;
  }

  const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";

  function registerJob(
    name: string,
    schedule: string,
    job: () => Promise<unknown>,
  ): void {
    const task = cron.schedule(
      schedule,
      async () => {
        if (runningJobs.has(name)) {
          console.warn(`Skipping overlapping cron job: ${name}`);
          return;
        }
        runningJobs.add(name);
        console.log(`Cron job started: ${name}`);
        try {
          await job();
          console.log(`Cron job completed: ${name}`);
        } catch (error) {
          console.error(`Cron job failed: ${name}`, error);
        } finally {
          runningJobs.delete(name);
        }
      },
      { timezone },
    );
    tasks.push(task);
  }

  registerJob("daily-inventory-summary", "0 9 * * *",
    () => emailService.sendDailyInventorySummary(),
  );

  registerJob("low-stock-alert", "0 9 * * *",
    () => emailService.sendLowerStockAlert(),
  );

  registerJob("weekly-inventory-report", "0 9 * * 1",
    () => emailService.sendWeeklyInventoryReport(),
  );
  console.log(`Email cron jobs registered. Timezone: ${timezone}`);
}

export function stopCron(): void {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
  console.log("Email cron jobs stopped.");
}
=======
export const startCron = () => {
  // const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
  cron.schedule("0 9 * * *", async () => {
    console.log("Running Daily Inventory Summary...");
    await emailService.sendDailyInventorySummary();
  });

  cron.schedule("0 9 * * *", async () => {
    console.log("Running Low Stock Alert...");
    await emailService.sendLowerStockAlert();
  });

  cron.schedule("0 9 * * 1", async () => {
    console.log("Running weekly Inventory Report...");
    await emailService.sendWeeklyInventoryReport();
  });
  console.log("Cron Running...");
};
>>>>>>> origin/main
