import request from "supertest";
import app from "../app.js";

describe("Dashboard API", () => {
  let accessToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "aviitaliya1310@gmail.com",
      password: "Password@123",
    });

    console.log("Login response:", loginResponse.body);

    expect(loginResponse.statusCode).toBe(200);

    accessToken = loginResponse.body.data.accessToken;
  });

  it("should return dashboard data", async () => {
    const response = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${accessToken}`);

    console.log("Dashboard response:", response.body);

    expect(response.statusCode).toBe(200);
  });

  it("should reject request without authentication", async () => {
    const response = await request(app).get("/api/dashboard");

    expect(response.statusCode).toBe(401);
  });

  it("should reject invalid access token", async () => {
    const response = await request(app)
      .get("/api/dashboard")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
  });
});
