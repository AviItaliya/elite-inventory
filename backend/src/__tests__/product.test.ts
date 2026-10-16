import request from "supertest";
import app from "../app.js";

describe("Product route integration (no database required)", () => {
  it("requires authentication for listing products", async () => {
    const response = await request(app).get("/api/products/get-all");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("requires authentication before creating a product", async () => {
    const response = await request(app)
      .post("/api/products/create")
      .send({ name: "Test", sku: "TEST-1", price: 10 });
    expect(response.status).toBe(401);
  });
});
