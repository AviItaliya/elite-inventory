import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const errorMiddleware: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }
  if (error instanceof Error && error.message === "Not allowed by CORS") {
    logger.warn("CORS request rejected", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
    });
    res.status(403).json({
      success: false,
      message: "Origin is not allowed",
    });
    return;
  }
  logger.error("Unhandled application error", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorMiddleware;