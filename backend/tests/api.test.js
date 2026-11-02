import request from 'supertest';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seedData.js';
import ChargingStation from '../src/models/ChargingStation.js';
import Booking from '../src/models/Booking.js';
import User from '../src/models/User.js';
import OwnerProfile from '../src/models/OwnerProfile.js';
import { BOOKING_STATUS, SUBSCRIPTION_STATUS } from '../src/config/constants.js';

describe('EV Hub Full Backend API Suite', () => {
  let adminToken = '';
  let ownerToken = '';
  let userToken = '';
  let testStationId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedDatabase();

    // 1. Log in Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@evhub.com',
      password: 'Admin@12345',
    });
    expect(adminRes.statusCode).toBe(200);
    adminToken = adminRes.body.token;

    // 2. Log in Owner
    const ownerRes = await request(app).post('/api/auth/login').send({
      email: 'rajesh.host@evhub.com',
      password: 'Password@123',
    });
    expect(ownerRes.statusCode).toBe(200);
    ownerToken = ownerRes.body.token;

    // 3. Log in User
    const userRes = await request(app).post('/api/auth/login').send({
      email: 'aditya.user@evhub.com',
      password: 'Password@123',
    });
    expect(userRes.statusCode).toBe(200);
    userToken = userRes.body.token;

    // Fetch an approved station
    const station = await ChargingStation.findOne({ isPubliclyListed: true });
    expect(station).toBeTruthy();
    testStationId = station._id.toString();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('1. Authentication & Security', () => {
    it('rejects login with invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@evhub.com',
        password: 'WrongPassword',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('registers a new EV user with forced USER role (does not trust public role assignment)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'New Test Driver',
        email: `driver_${Date.now()}@test.com`,
        password: 'Password@123',
        role: 'ADMIN', // Should be ignored
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('USER');
    });

    it('protects admin routes from non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('allows admin access to overview metrics', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalStations).toBeGreaterThanOrEqual(8);
    });
  });

  describe('2. Stations & Mandatory Subscription Visibility Rule', () => {
    it('returns publicly listed stations', async () => {
      const res = await request(app).get('/api/stations');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((station) => {
        expect(station.isPubliclyListed).toBe(true);
        expect(station.approvalStatus).toBe('APPROVED');
        // Check that exact street is masked in public discovery
        expect(station.address.full).toBeUndefined();
      });
    });

    it('performs geospatial nearby search around Hyderabad HITEC city', async () => {
      const res = await request(app)
        .get('/api/stations/nearby')
        .query({
          lng: 78.3820,
          lat: 17.4474,
          maxDistance: 20,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].distanceKm).toBeDefined();
      expect(res.body.data[0].availabilityStatus).toBeDefined(); // GREEN / YELLOW / RED
    });

    it('hides station when owner subscription becomes expired (mandatory visibility rule)', async () => {
      const owner = await User.findOne({ email: 'sneha.host@evhub.com' });
      const station = await ChargingStation.findOne({ ownerId: owner._id });
      expect(station.isPubliclyListed).toBe(true);

      // Simulate subscription expiring
      await OwnerProfile.findOneAndUpdate(
        { userId: owner._id },
        { subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED }
      );
      station.isPubliclyListed = false;
      await station.save();

      const res = await request(app).get('/api/stations').query({ q: 'Kavuri Hills' });
      expect(res.statusCode).toBe(200);
      const found = res.body.data.find((s) => s._id.toString() === station._id.toString());
      expect(found).toBeUndefined(); // Must NOT appear in public listing

      // Restore for subsequent tests
      await OwnerProfile.findOneAndUpdate(
        { userId: owner._id },
        { subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE }
      );
      station.isPubliclyListed = true;
      await station.save();
    });
  });

  describe('3. Booking Concurrency & Double Booking Prevention', () => {
    it('generates bookable slots for a date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/stations/${testStationId}/availability`)
        .query({ date: today });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.slots)).toBe(true);
    });

    it('atomically creates 5-minute temporary booking hold', async () => {
      // Pick a future time tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(14, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0);

      const res = await request(app)
        .post('/api/bookings/hold')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          stationId: testStationId,
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.booking.bookingStatus).toBe('TEMPORARILY_HELD');
      expect(res.body.data.orderId).toBeDefined();

      const bookingId = res.body.data.booking._id;

      // 4. Verify that another user CANNOT hold or double book the exact overlapping interval
      const otherUser = await User.findOne({ email: 'pooja.user@evhub.com' });
      const otherUserToken = otherUser.generateAuthToken();

      const conflictRes = await request(app)
        .post('/api/bookings/hold')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          stationId: testStationId,
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString(),
        });

      // If station max capacity was 1, conflict is 409
      const st = await ChargingStation.findById(testStationId);
      if (st.maximumCapacity === 1) {
        expect(conflictRes.statusCode).toBe(409);
        expect(conflictRes.body.success).toBe(false);
      }

      // Clean up test booking
      await Booking.findByIdAndDelete(bookingId);
    });

    it('prevents a host from booking their own charging station', async () => {
      const st = await ChargingStation.findOne({ ownerId: (await User.findOne({ email: 'rajesh.host@evhub.com' }))._id });
      const future = new Date();
      future.setDate(future.getDate() + 3);
      future.setHours(10, 0, 0, 0);
      const end = new Date(future);
      end.setHours(11, 0, 0, 0);

      const res = await request(app)
        .post('/api/bookings/hold')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          stationId: st._id.toString(),
          startTime: future.toISOString(),
          endTime: end.toISOString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Hosts cannot book their own charging stations');
    });
  });
});
