import cron from "node-cron";
import emailService from "../services/emailService.js";

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
