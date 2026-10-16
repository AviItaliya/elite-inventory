import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  if (res.headersSent) {
    _next(error);
    return;
  }

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
    res.status(403).json({ success: false, message: "Origin is not allowed" });
    return;
  }

  // express.json() errors occur before controllers and must not become 500s.
  if (error && typeof error === "object" && "type" in error) {
    if (error.type === "entity.parse.failed") {
      res
        .status(400)
        .json({ success: false, message: "Invalid JSON request body" });
      return;
    }
    if (error.type === "entity.too.large") {
      res
        .status(413)
        .json({ success: false, message: "Request body is too large" });
      return;
    }
  }

  // Map known Prisma failures to safe, predictable API responses.
  // Do not return raw Prisma messages: they may expose table names or query details.
  if (
    error instanceof Error &&
    error.name === "PrismaClientKnownRequestError"
  ) {
    const code = (error as Error & { code?: string }).code;
    const responses: Record<string, { status: number; message: string }> = {
      P2002: {
        status: 409,
        message: "A record with these values already exists",
      },
      P2003: {
        status: 409,
        message: "This operation conflicts with a related record",
      },
      P2025: { status: 404, message: "Requested record was not found" },
      P2024: {
        status: 503,
        message: "Database is temporarily busy. Please try again",
      },
    };
    const mapped = code ? responses[code] : undefined;
    if (mapped) {
      res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });
      return;
    }
  }

  if (
    error instanceof Error &&
    ["PrismaClientInitializationError", "PrismaClientRustPanicError"].includes(
      error.name,
    )
  ) {
    logger.error("Database unavailable", {
      requestId: req.requestId,
      errorName: error.name,
    });
    res
      .status(503)
      .json({ success: false, message: "Database is temporarily unavailable" });
    return;
  }

  logger.error("Unhandled application error", {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });

  res.status(500).json({ success: false, message: "Internal server error" });
};

export default errorMiddleware;
