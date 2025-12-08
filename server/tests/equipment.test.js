import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.js';
import Equipment from '../models/Equipment.js';

let mongo;
let token;
let userId;

beforeAll(async () => {
  // Start in-memory database
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  });

  userId = user._id.toString();

  // Generate auth token using JWT_SECRET from env
  token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await Equipment.deleteMany({});
});

describe('Equipment API', () => {
  let createdId;

  test('Create equipment (201)', async () => {
    const res = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        unitNumber: 'Truck 1',
        year: 2018,
        make: 'Peterbilt',
        model: '579',
        currentMileage: 125000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    createdId = res.body._id;
  });

  test('Create equipment without token (401)', async () => {
    const res = await request(app).post('/api/equipment').send({
      unitNumber: 'Truck 1',
      year: 2018,
      make: 'Peterbilt',
      model: '579',
      currentMileage: 125000,
    });

    expect(res.statusCode).toBe(401);
  });

  test('Get all equipment (200)', async () => {
    await Equipment.create({
      unitNumber: 'Truck 1',
      year: 2018,
      make: 'Peterbilt',
      model: '579',
      currentMileage: 125000,
      userId,
    });

    const res = await request(app)
      .get('/api/equipment')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('Get equipment by ID (200)', async () => {
    const eq = await Equipment.create({
      unitNumber: 'Truck 2',
      year: 2020,
      make: 'Kenworth',
      model: 'T680',
      currentMileage: 90000,
      userId,
    });

    const res = await request(app)
      .get(`/api/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(eq._id.toString());
  });

  test('Update equipment (200)', async () => {
    const eq = await Equipment.create({
      unitNumber: 'Truck 3',
      year: 2017,
      make: 'Volvo',
      model: 'VNL',
      currentMileage: 450000,
      userId,
    });

    const res = await request(app)
      .put(`/api/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentMileage: 460000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.currentMileage).toBe(460000);
  });

  test('Delete equipment (204)', async () => {
    const eq = await Equipment.create({
      unitNumber: 'Truck 4',
      year: 2019,
      make: 'International',
      model: 'LT',
      currentMileage: 300000,
      userId,
    });

    const res = await request(app)
      .delete(`/api/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
