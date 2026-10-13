import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import dashboardService from "../services/dashboardService.js";

class DashboardController {
  getDashboard = asyncHandler(
    async (req: Request, res: Response) => {
      const { startDate, endDate } = req.query;

      if (
        startDate !== undefined &&
        typeof startDate !== "string"
      ) {
        throw new AppError("Invalid startDate.", 400);
      }

      if (
        endDate !== undefined &&
        typeof endDate !== "string"
      ) {
        throw new AppError("Invalid endDate.", 400);
      }

      const parseDate = (
        value: string | undefined,
        fieldName: string
      ): Date | undefined => {
        if (!value) {
          return undefined;
        }

        // Require YYYY-MM-DD format.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          throw new AppError(
            `${fieldName} must use YYYY-MM-DD format.`,
            400
          );
        }

        const date = new Date(`${value}T00:00:00.000Z`);

        // Reject impossible dates, such as 2026-02-30.
        if (
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== value
        ) {
          throw new AppError(
            `${fieldName} is not a valid date.`,
            400
          );
        }

        return date;
      };

      const parsedStartDate = parseDate(
        startDate as string | undefined,
        "startDate"
      );

      const parsedEndDate = parseDate(
        endDate as string | undefined,
        "endDate"
      );

      if (
        parsedStartDate &&
        parsedEndDate &&
        parsedStartDate > parsedEndDate
      ) {
        throw new AppError(
          "startDate must be before or equal to endDate.",
          400
        );
      }

      // Make the end date inclusive by moving the upper
      // boundary to midnight of the following day.
      const exclusiveEndDate = parsedEndDate
        ? new Date(
            parsedEndDate.getTime() + 24 * 60 * 60 * 1000
          )
        : undefined;

      const dashboard = await dashboardService.getDashboard({
        ...(parsedStartDate !== undefined
          ? { startDate: parsedStartDate }
          : {}),
        ...(exclusiveEndDate !== undefined
          ? { endDate: exclusiveEndDate }
          : {}),
      });

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