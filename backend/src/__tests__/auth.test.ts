import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
  it("should login successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "aviitaliya1310@gmail.com",
        password: "Password@123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });
});