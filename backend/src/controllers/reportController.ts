import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import reportService from "../services/reportService.js";

class ReportController {
  private parseDate(
    value: unknown,
    field: string
  ): Date | undefined {
    if (value === undefined) return undefined;

    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      throw new AppError(
        `${field} must use YYYY-MM-DD format.`,
        400
      );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new AppError(`${field} is invalid.`, 400);
    }

    return date;
  }

  private getDateFilters(req: Request) {
    const start = this.parseDate(req.query.startDate, "startDate");
    const end = this.parseDate(req.query.endDate, "endDate");

    if (start && end && start > end) {
      throw new AppError(
        "startDate must be before or equal to endDate.",
        400
      );
    }

    const exclusiveEnd = end
      ? new Date(end.getTime() + 24 * 60 * 60 * 1000)
      : undefined;

    return {
      ...(start ? { startDate: start } : {}),
      ...(exclusiveEnd ? { endDate: exclusiveEnd } : {}),
    };
  }

  downloadFinancialReport = asyncHandler(
    async (req: Request, res: Response) => {
      const filters = this.getDateFilters(req);

      const pdf =
        await reportService.generateFinancialReport(filters);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="elite-inventory-financial-report.pdf"'
      );

      return res.status(200).send(pdf);
    }
  );

  downloadFinancialExcel = asyncHandler(
    async (req: Request, res: Response) => {
      const filters = this.getDateFilters(req);

      const excel =
        await reportService.generateFinancialExcelReport(filters);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="elite-inventory-financial-report.xlsx"'
      );

      return res.status(200).send(excel);
    }
  );
}

export default new ReportController();