import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";
import { DB_NAME } from "../constants";
import { User } from "../models/user.model";

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
  });

  it("should not allow duplicate email", async () => {
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
  });
});
