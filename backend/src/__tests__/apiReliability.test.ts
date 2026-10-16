import express, { type Express } from "express";
import request from "supertest";
import { z } from "zod";
import errorMiddleware from "../middlewares/errorMiddleware.js";
import AppError from "../utils/AppError.js";
import { validateRequest } from "../middlewares/validateRequest.js";

// An isolated Express app: tests API middleware without a database,
// external email providers, Firebase, or real authentication tokens.
function createTestApp(): Express {
  const app = express();
  app.use(express.json({ limit: "1kb" }));

  app.post(
    "/validate",
    validateRequest("body", z.object({ name: z.string().trim().min(1), quantity: z.number().int().positive() })),
    (_req, res) => { res.status(201).json({ success: true }); },
  );
  app.get("/protected", (_req, _res, next) => next(new AppError("Authentication required", 401)));
  app.get("/forbidden", (_req, _res, next) => next(new AppError("Permission denied", 403)));
  app.get("/unexpected", (_req, _res, next) => next(new Error("secret database details")));
  app.get("/prisma-duplicate", (_req, _res, next) => {
    const error = Object.assign(new Error("private constraint"), { code: "P2002" });
    error.name = "PrismaClientKnownRequestError";
    next(error);
  });
  app.get("/prisma-missing", (_req, _res, next) => {
    const error = Object.assign(new Error("private query"), { code: "P2025" });
    error.name = "PrismaClientKnownRequestError";
    next(error);
  });
  app.use(errorMiddleware);
  return app;
}

const app = createTestApp();

describe("API validation and error handling", () => {
  it("accepts a valid request", async () => {
    const response = await request(app).post("/validate").send({ name: "Laptop", quantity: 2 });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true });
  });

  it("returns structured Zod errors for invalid input", async () => {
    const response = await request(app).post("/validate").send({ name: "", quantity: -1 });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "name" }),
      expect.objectContaining({ field: "quantity" }),
    ]));
  });

  it("rejects malformed JSON with 400", async () => {
    const response = await request(app).post("/validate").set("Content-Type", "application/json").send('{"name":');
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "Invalid JSON request body" });
  });

  it("rejects oversized JSON with 413", async () => {
    const response = await request(app).post("/validate").send({ name: "x".repeat(2000), quantity: 1 });
    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
  });

  it.each([["/protected", 401], ["/forbidden", 403]])("preserves AppError status for %s", async (path, status) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(status);
    expect(response.body.success).toBe(false);
  });

  it("hides unexpected error details", async () => {
    const response = await request(app).get("/unexpected");
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");
    expect(JSON.stringify(response.body)).not.toContain("secret database details");
  });

  it.each([["/prisma-duplicate", 409], ["/prisma-missing", 404]])("maps Prisma error for %s", async (path, status) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(status);
    expect(response.body.success).toBe(false);
    expect(JSON.stringify(response.body)).not.toContain("private");
  });
});
