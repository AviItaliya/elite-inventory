import type { RequestHandler } from "express";
import AppError from "../utils/AppError.js";

/** Validate raw pagination inputs without mutating Express req.query. */
export const validatePagination: RequestHandler = (req, _res, next) => {
  for (const key of ["page", "limit"] as const) {
    const value = req.query[key];
    if (value === undefined) continue;
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value) ||
        !Number.isSafeInteger(Number(value))) {
      return next(new AppError(`${key === "page" ? "Page" : "Limit"} must be a positive integer.`, 400));
    }
    if (key === "limit" && Number(value) > 100) {
      return next(new AppError("Limit cannot exceed 100.", 400));
    }
    // Keep the offset within JavaScript's safe integer range.
    if (key === "page" && Number(value) > 90071992547409) {
      return next(new AppError("Page is too large.", 400));
    }
  }
  next();
};
