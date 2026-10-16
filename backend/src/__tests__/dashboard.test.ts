import request from "supertest";
import app from "../app.js";

describe("Dashboard route integration (no database required)", () => {
  it("rejects requests without authentication", async () => {
    const response = await request(app).get("/api/dashboard");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects invalid access tokens", async () => {
    const response = await request(app)
      .get("/api/dashboard")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
  });
});
