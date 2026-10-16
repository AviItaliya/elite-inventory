import request from "supertest";
import app from "../app.js";

describe("Express route integration", () => {
  it("exposes the public health endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true });
  });

  it("protects inventory transaction creation", async () => {
    const response = await request(app)
      .post("/api/inventory-transactions")
      .send({ productId: "fake", type: "STOCK_IN", quantity: 1 });
    expect(response.status).toBe(401);
  });

  it("protects inventory transaction listing", async () => {
    const response = await request(app).get("/api/inventory-transactions");
    expect(response.status).toBe(401);
  });

  it("rejects malformed JSON with a client error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
