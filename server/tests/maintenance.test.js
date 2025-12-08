import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';

import Equipment from '../models/Equipment.js';
import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';

describe('Maintenance API', () => {
  let token;
  let userId;
  let equipmentId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Create user
    const user = await User.create({
      name: 'Test User',
      email: 'testMaintenance@example.com',
      password: 'Password123!',
    });

    userId = user._id.toString();

    // FIXED: match authMiddleware (decoded.userId)
    token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create equipment
    const equipment = await Equipment.create({
      unitNumber: '55',
      name: 'Test Excavator',
      type: 'Excavator',
      make: 'Caterpillar',
      model: '320D',
      year: 2020,
      userId,
    });

    equipmentId = equipment._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Maintenance.deleteMany({});
    await mongoose.connection.close();
  });

  // CREATE Maintenance
  it('should create maintenance', async () => {
    const res = await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId,
        type: 'Oil Change',
        cost: 500,
        mileage: 1200,
        date: new Date(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('Oil Change');
    expect(res.body.equipmentId).toBe(equipmentId);
  });

  // GET All Maintenance
  it('should get all maintenance records for user', async () => {
    await Maintenance.create({
      equipmentId,
      userId,
      cost: 200,
      type: 'Tire Rotation',
      mileage: 2000,
      date: new Date(),
    });

    const res = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // GET Maintenance by Equipment
  it('should get maintenance for specific equipment', async () => {
    const res = await request(app)
      .get(`/api/maintenance/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // UPDATE Maintenance
  it('should update a maintenance record', async () => {
    const maintenance = await Maintenance.create({
      equipmentId,
      userId,
      cost: 1000,
      type: 'Filter Replacement',
      mileage: 1500,
      date: new Date(),
    });

    const res = await request(app)
      .put(`/api/maintenance/${maintenance._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'Updated Filter Replacement' });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('Updated Filter Replacement');
  });

  // DELETE Maintenance
  it('should delete a maintenance record', async () => {
    const maintenance = await Maintenance.create({
      equipmentId,
      userId,
      cost: 250,
      type: 'Brake Inspection',
      mileage: 1800,
      date: new Date(),
    });

    const res = await request(app)
      .delete(`/api/maintenance/${maintenance._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
