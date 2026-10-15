import request from "supertest";
import app from "../app.js";

describe("Product API", () => {
  it("should get products", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: "avikitaliya2018@gmail.com",
        password: "avi@1213",
      });

    const token = login.body.data.accessToken;

    const response = await request(app)
      .get("/api/products/get-all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});