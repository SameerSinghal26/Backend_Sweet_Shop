import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";
import { DB_NAME } from "../constants";
import { User } from "../models/user.model";

beforeAll(async () => {
  const uri = process.env.MONGODB_URI as string;
  const dbName = process.env.DB_NAME || DB_NAME;
  await mongoose.connect(`${uri}/${dbName}`);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Sweet API", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});

describe("Auth API", () => {
  // ---------- REGISTER ----------
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("sam@example.com");
  });

  it("should not allow duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  // ---------- LOGIN ----------
  it("should login with correct credentials", async () => {
    // First register
    await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    // Then login
    const res = await request(app).post("/api/auth/login").send({
      email: "sam@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("sam@example.com");
  });

  it("should not login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "sam@example.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should not login with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "notfound@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
