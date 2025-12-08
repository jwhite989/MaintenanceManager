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
  let otherEquipmentId;
  let createdMaintenanceId;
  const TEST_USER_EMAIL = 'testMaintenance@example.com';

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // 2. Create user
    await User.deleteMany({ email: TEST_USER_EMAIL });
    const user = await User.create({
      name: 'Test Maintenance User',
      email: TEST_USER_EMAIL,
      password: 'Password123!',
    });
    userId = user._id.toString();

    // 3. Generate token for authentication
    token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 4. Create main equipment record
    await Equipment.deleteMany({ userId });
    const equipment = await Equipment.create({
      unitNumber: 'T-001',
      name: 'Test Truck',
      type: 'Truck',
      make: 'Ford',
      model: 'F-150',
      year: 2020,
      userId,
    });
    equipmentId = equipment._id.toString();

    // 5. Create a second equipment record for Test 5
    const otherEquipment = await Equipment.create({
      unitNumber: 'T-002',
      name: 'Test Trailer',
      type: 'Trailer',
      make: 'Utility',
      model: '3000R',
      year: 220,
      userId,
    });
    otherEquipmentId = otherEquipment._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: TEST_USER_EMAIL });
    await Equipment.deleteMany({ userId });
    await Maintenance.deleteMany({ userId });
    await mongoose.connection.close();
  });

  // --- Test Cases ---

  // Test 1: Create Maintenance (Checks 201, serviceType, equipmentId)
  it('1. should create a maintenance record and return 201', async () => {
    const res = await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId,
        serviceType: 'preventative maintenance',
        date: new Date('2024-11-15'),
        mileage: 125500,
        cost: 150,
        notes: 'Full synthetic oil',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.serviceType).toBe('preventative maintenance');
    expect(res.body.equipmentId).toBe(equipmentId);

    // Save the ID for Update/Delete tests
    createdMaintenanceId = res.body._id;
  });

  // Test 2: Create with Invalid Equipment (Checks 404)
  it('2. should return 404 if equipmentId is invalid or not owned by user', async () => {
    const fakeEquipmentId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId: fakeEquipmentId,
        serviceType: 'other',
        cost: 150,
        mileage: 125000,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Equipment not found');
  });

  // Test 3: Get All Maintenance (Checks 200, array length >= 1)
  it('3. should get all maintenance records for the user and return 200', async () => {
    const res = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Test 4: Get Maintenance by Equipment (Checks 200, filtering)
  it('4. should get maintenance for specific equipment and return 200', async () => {
    const res = await request(app)
      .get(`/api/maintenance/${equipmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].equipmentId).toBe(equipmentId);
  });

  // Test 5: Create Multiple Records (Checks array length >= 3)
  it('5. should create multiple records for different equipment', async () => {
    // Record 1 for equipmentId
    await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId,
        serviceType: 'planned',
        cost: 300,
        date: new Date(),
        mileage: 130000,
      });

    // Record 2 for otherEquipmentId
    await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId: otherEquipmentId,
        serviceType: 'breakdown',
        cost: 500,
        date: new Date(),
        mileage: 50000,
      });

    // Verify total records is now at least 3 (1 from Test 1 + 2 here)
    const res = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  // Test 6: Update Maintenance (Checks 200, updated cost/notes)
  it('6. should update a maintenance record and return 200', async () => {
    const res = await request(app)
      .put(`/api/maintenance/${createdMaintenanceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        cost: 175,
        notes: 'Updated cost due to filter change',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.cost).toBe(175);
    expect(res.body.notes).toBe('Updated cost due to filter change');
  });

  // Test 7: Delete Maintenance (Checks 204, subsequent 404)
  it('7. should delete a maintenance record and return 204', async () => {
    const res = await request(app)
      .delete(`/api/maintenance/${createdMaintenanceId}`)
      .set('Authorization', `Bearer ${token}`);

    // Expect 204 No Content for successful deletion
    expect(res.statusCode).toBe(204);

    // Verify deletion by trying to update the deleted record (expect 404)
    const fetchRes = await request(app)
      .put(`/api/maintenance/${createdMaintenanceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        cost: 999,
        mileage: 125000,
      });

    expect(fetchRes.statusCode).toBe(404);
    expect(fetchRes.body.message).toBe('Maintenance record not found');
  });
});
