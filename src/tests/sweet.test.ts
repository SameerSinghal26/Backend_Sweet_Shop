import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";
import { DB_NAME } from "../constants";
import { User } from "../models/user.model";
import { Sweet } from "../models/sweet.model";
import jwt from "jsonwebtoken";

jest.setTimeout(30000);

const createUserAndToken = async (role = "user") => {
  const u = await User.create({ name: role, email: `${role}@test.com`, password: "pass123", role });
  const token = jwt.sign({ _id: u._id.toString(), role: u.role }, process.env.ACCESS_TOKEN_SECRET as string);
  return { user: u, token };
};

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
  await Sweet.deleteMany({});
});

describe("Sweets API", () => {
  it("GET /api/sweets should return empty array initially", async () => {
    const res = await request(app).get("/api/sweets");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/sweets should allow admin to add sweet", async () => {
    const { token } = await createUserAndToken("admin");
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Lollipop", category: "Candy", price: 1.5, quantity: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("name", "Lollipop");
  });

  it("POST /api/sweets should forbid non-admin", async () => {
    const { token } = await createUserAndToken("user");
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Lollipop", category: "Candy", price: 1.5, quantity: 10 });
    expect(res.status).toBe(403);
  });

  it("GET /api/sweets/search should filter by name/category/price range", async () => {
    const { token } = await createUserAndToken("admin");
    await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mint", category: "Candy", price: 0.5, quantity: 10 });
    await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Choco", category: "Chocolate", price: 2.0, quantity: 5 });

    const res1 = await request(app).get("/api/sweets/search").query({ name: "min" });
    expect(res1.status).toBe(200);
    expect(res1.body.length).toBeGreaterThanOrEqual(1);

    const res2 = await request(app).get("/api/sweets/search").query({ minPrice: 1, maxPrice: 3 });
    expect(res2.status).toBe(200);
    expect(res2.body.some((s: any) => s.name === "Choco")).toBe(true);
  });

  it("PUT /api/sweets/:id should update a sweet (admin only)", async () => {
    const { token } = await createUserAndToken("admin");
    const create = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bar", category: "Candy", price: 1, quantity: 2 });
    const id = create.body._id;
    const res = await request(app)
      .put(`/api/sweets/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 1.5 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1.5);
  });

  it("DELETE /api/sweets/:id should delete sweet (admin only)", async () => {
    const { token } = await createUserAndToken("admin");
    const create = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "ToDelete", category: "Candy", price: 1, quantity: 2 });
    const id = create.body._id;
    const res = await request(app)
      .delete(`/api/sweets/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  // Inventory: purchase & restock
  it("POST /api/sweets/:id/purchase should decrease quantity and fail when out of stock", async () => {
    const { token } = await createUserAndToken("admin");
    const create = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "BuyMe", category: "Candy", price: 1, quantity: 2 });
    const id = create.body._id;

    const r1 = await request(app).post(`/api/sweets/${id}/purchase`).set("Authorization", `Bearer ${token}`);
    expect(r1.status).toBe(200);
    expect(r1.body.quantity).toBe(1);

    const r2 = await request(app).post(`/api/sweets/${id}/purchase`).set("Authorization", `Bearer ${token}`);
    expect(r2.status).toBe(200);
    expect(r2.body.quantity).toBe(0);

    const r3 = await request(app).post(`/api/sweets/${id}/purchase`).set("Authorization", `Bearer ${token}`);
    expect(r3.status).toBe(400);
  });

  it("POST /api/sweets/:id/restock should increase quantity (admin only)", async () => {
    const { token } = await createUserAndToken("admin");
    const create = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "RestockMe", category: "Candy", price: 1, quantity: 0 });
    const id = create.body._id;

    const r = await request(app).post(`/api/sweets/${id}/restock`).set("Authorization", `Bearer ${token}`).send({ amount: 5 });
    expect(r.status).toBe(200);
    expect(r.body.quantity).toBe(5);
  });
});
