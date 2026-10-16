import request from "supertest";
import app from "../app.js";

describe("Auth route integration (no database required)", () => {
  it("rejects unauthenticated profile requests", async () => {
    const response = await request(app).get("/api/auth/profile");
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false });
  });

  it("rejects invalid bearer tokens", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects incorrectly formatted authorization headers", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "invalid-token");
    expect(response.status).toBe(401);
  });
});
