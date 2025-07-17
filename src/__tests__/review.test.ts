import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import User from '../models/userModel';
import Tour from '../models/tourModel';
import Review from '../models/reviewModel';
import { mockUser, mockTour, mockReview } from './mockData';

let testUser: any;
let testTour: any;
let userToken: string;
let tourId: string;
let reviewId: string;

beforeEach(async () => {
  await User.deleteMany({});
  await Tour.deleteMany({});
  await Review.deleteMany({});
  testUser = await User.create(mockUser);
  testTour = await Tour.create(mockTour);
  // Login to get token
  const login = await request(app)
    .post('/api/v1/users/login')
    .send({ email: mockUser.email, password: mockUser.password });
  userToken = login.body.token;
  tourId = String(testTour._id);
});

describe('Review API', () => {
  it('should create a review', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...mockReview, tour: tourId })
      .expect(201);
    expect(res.body.data.data.review).toBe(mockReview.review);
    reviewId = res.body.data.data._id;
  });

  it('should get all reviews', async () => {
    const res = await request(app)
      .get('/api/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it('should update a review', async () => {
    // Create review first
    const createRes = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...mockReview, tour: tourId })
      .expect(201);
    reviewId = createRes.body.data.data._id;
    // Update review
    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ review: 'Updated review', rating: 4 })
      .expect(200);
    expect(res.body.data.data.review).toBe('Updated review');
  });

  it('should delete a review', async () => {
    // Create review first
    const createRes = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...mockReview, tour: tourId })
      .expect(201);
    reviewId = createRes.body.data.data._id;
    // Delete review
    await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);
  });
});
