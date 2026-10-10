import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};

export default requestIdMiddleware;
