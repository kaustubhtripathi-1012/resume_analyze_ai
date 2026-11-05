const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
  it('registers a new candidate successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123',
        role: 'candidate'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('email', 'jane@example.com');
    expect(res.body.user.role).toBe('candidate');
  });

  it('rejects registration with duplicate email (409)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe 2',
        email: 'jane@example.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('logs in registered user and returns access token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid password (401)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('authenticates user on /api/auth/me with Bearer token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password@123'
      });

    const token = reg.body.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('jane@example.com');
  });
});

