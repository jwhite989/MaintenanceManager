import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../server.js";
import User from "../models/User.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Routes", () => {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "StrongPass1!",
  };

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.token).toBeDefined();
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(400);
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(userData.email);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "BadPass1!",
    });

    expect(res.status).toBe(401);
  });
});
