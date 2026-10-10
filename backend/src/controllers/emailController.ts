// import type { Request, Response } from "express";
// import asyncHandler from "../utils/asyncHandler.js";
// import emailService from "../services/emailService.js";
// import { sendResponse } from "../utils/response.js";
// import AppError from "../utils/AppError.js";

// class EmailController {
//   sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
//     const { email } = req.body;
//     await emailService.sendTestEmail(email);
//     return sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: "Test email sent successfully.",
//     });
//   });

  // sendLowStockAlert = asyncHandler(async (req: Request, res: Response) => {
  //   const { email } = req.body;
  //   await emailService.sendLowerStockAlert(email);
  //   return sendResponse(res, {
  //     success: true,
  //     statusCode: 200,
  //     message: "Low stock alert email sent successfully.",
  //   });
  // });

  // sendDailyInventorySummary = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const { email } = req.body;
  //     if (!email) {
  //       throw new AppError("Email is required.", 400);
  //     }
  //     await emailService.sendDailyInventorySummary(email);
  //     sendResponse(res, {
  //       success: true,
  //       statusCode: 200,
  //       message: "Daily inventory summary sent successfully.",
  //     });
  //   },
  // );

  // sendWeeklyInventoryReport = asyncHandler(async(req:Request, res:Response) => {
  //   const {email} = req.body;
  //   if(!email) {
  //       throw new AppError("Email is required.", 400);
  //   }
  //   await emailService.sendWeeklyInventoryReport(email);
  //   return sendResponse(res, {
  //       success: true,
  //       statusCode: 200,
  //       message: "Weekly inventory report sent successfully."
  //   });
  // });

  import type { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";

import emailService from "../services/emailService.js";

import { sendResponse } from "../utils/response.js";

class EmailController {
  sendLowStockAlert = asyncHandler(
    async (_req: Request, res: Response) => {
      await emailService.sendLowerStockAlert();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Low stock alert email sent successfully.",
      });
    },
  );

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
// }
// export default new EmailController();
