import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import User from '../models/userModel';
import Tour from '../models/tourModel';
import Booking from '../models/bookingModel';
import { mockUser, mockTour, mockBooking } from './mockData';

let testUser: any;
let testTour: any;
let userToken: string;
let tourId: string;
let bookingId: string;

describe('Booking API', () => {
  beforeAll(async () => {
    // Create user and login
    await User.create(mockUser);
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: mockUser.password });
    userToken = login.body.token;
    // Create tour
    const tour = await Tour.create(mockTour);
    // Ensure tour._id is a string or convert safely
    tourId =
      typeof tour._id === 'string' ? tour._id : tour._id?.toString?.() ?? '';
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    testUser = await User.create(mockUser);
    testTour = await Tour.create(mockTour);
    tourId = String(testTour._id);
    // Login to get token
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: mockUser.password });
    userToken = login.body.token;
  });

  it('should create a checkout session', async () => {
    const res = await request(app)
      .get(`/api/v1/bookings/checkout-session/${tourId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session).toHaveProperty('id');
  });

  it('should create and get a booking by id', async () => {
    // Create booking
    const booking = await Booking.create({
      ...mockBooking,
      user: testUser._id,
      tour: testTour._id
    });
    bookingId = String(booking._id);
    // Get booking
    const res = await request(app)
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.data.data._id).toBe(bookingId);
    expect(res.body.data.data.tour._id).toBe(tourId);
  });
});
