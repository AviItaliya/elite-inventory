import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const validateNotificationId = (req: Request, _res: Response, next: NextFunction): void => {
  const id = req.params.id;
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    return next(new AppError("Invalid notification ID.", 400));
  }
  next();
};

export const validateNotificationPagination = (req: Request, _res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;
  if (page !== undefined) {
    if (typeof page !== "string" || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page))) {
      return next(new AppError("Page must be a positive integer.", 400));
    }
  }

  if (limit !== undefined) {
    if (typeof limit !== "string" || !/^[1-9]\d*$/.test(limit) || !Number.isSafeInteger(Number(limit)) || Number(limit) > 100) {
      return next(new AppError("Limit must be an integer between 1 and 100.", 400)
      );
    }
  }
  next();
};