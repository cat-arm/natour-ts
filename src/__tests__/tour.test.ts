import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import Tour from '../models/tourModel';
import User from '../models/userModel';
import { mockUser, mockTour } from './mockData';

let testUser: any;
let userToken: string;
let tourId: string;

describe('Tour API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Tour.deleteMany({});
    testUser = await User.create({ ...mockUser, role: 'admin' });
    // Login as admin
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: mockUser.password });
    userToken = login.body.token;
  });

  it('should create a new tour (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${userToken}`)
      .send(mockTour)
      .expect(201);
    expect(res.body.data.data.name).toBe(mockTour.name);
    tourId = res.body.data.data._id;
  });

  it('should get all tours', async () => {
    const res = await request(app)
      .get('/api/v1/tours')
      .expect(200);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it('should get a tour by id', async () => {
    // Create tour first
    const createRes = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${userToken}`)
      .send(mockTour)
      .expect(201);
    tourId = createRes.body.data.data._id;
    // Get tour by id
    const res = await request(app)
      .get(`/api/v1/tours/${tourId}`)
      .expect(200);
    expect(res.body.data.data._id).toBe(tourId);
  });
});
