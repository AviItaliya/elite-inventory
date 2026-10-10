import request from "supertest";
import app from "../app.js";

describe("Product API", () => {
  it("should get products", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: "aviitaliya1310@gmail.com",
        password: "Password@123",
      });

    const token = login.body.data.accessToken;

    const response = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});