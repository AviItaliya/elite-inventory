import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
  it("should login successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "avikitaliya2018@gmail.com",
        password: "avi@1213",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });
});