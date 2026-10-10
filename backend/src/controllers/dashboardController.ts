import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import dashboardService from "../services/dashboardService.js";

class DashboardController {
  getDashboard = asyncHandler(
    async (req: Request, res: Response) => {
      const dashboard = await dashboardService.getDashboard();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Dashboard data fetched successfully.",
        data: dashboard,
      });
    }
  );
}

export default new DashboardController();