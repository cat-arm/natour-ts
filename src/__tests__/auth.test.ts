import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import User from '../models/userModel';
import { mockUser } from './mockData';

describe('Auth API', () => {
  let token: string;

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send(mockUser)
      .expect(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.userObj.email).toBe(mockUser.email);
  });

  it('should login with correct credentials', async () => {
    await User.create(mockUser);
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with wrong password', async () => {
    await User.create(mockUser);
    await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: 'wrongpass' })
      .expect(401);
  });

  it('should protect route and return user profile', async () => {
    await User.create(mockUser);
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: mockUser.email, password: mockUser.password });
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);
    console.log('User Profile Response:', res.body); // log response
    expect(res.body.data.data.email).toBe(mockUser.email);
  });
});
