import type { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";

import emailService from "../services/emailService.js";

import { sendResponse } from "../utils/response.js";

class EmailController {
  sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
    const to = req.body?.to;

    if (typeof to !== "string" || !to.trim()) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Please provide a valid recipient email address.",
      });
    }

    await emailService.sendTestEmail(to.trim());

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Test email sent successfully.",
    });
  });

  sendLowStockAlert = asyncHandler(async (_req: Request, res: Response) => {
    await emailService.sendLowerStockAlert();

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Low stock alert email sent successfully.",
    });
  });

  sendDailyInventorySummary = asyncHandler(
    async (_req: Request, res: Response) => {
      await emailService.sendDailyInventorySummary();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Daily inventory summary sent successfully.",
      });
    },
  );

  sendWeeklyInventoryReport = asyncHandler(
    async (_req: Request, res: Response) => {
      await emailService.sendWeeklyInventoryReport();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Weekly inventory report sent successfully.",
      });
    },
  );
}

export default new EmailController();
