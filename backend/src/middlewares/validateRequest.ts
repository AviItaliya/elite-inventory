import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateRequest = (
  location: "body" | "params" | "query",
  schema: ZodType,
): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req[location]);
  if (!result.success) {
    next(result.error);
    return;
  }
  next();
};
