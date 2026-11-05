const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Admin API', () => {
  let adminToken, candidateToken, adminUser;

  beforeEach(async () => {
    // Create direct admin user in db
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@system.local',
      passwordHash: 'dummy',
      role: 'admin',
      isActive: true
    });

    const jwt = require('jsonwebtoken');
    const env = require('../src/config/env');
    adminToken = jwt.sign({ userId: adminUser._id.toString(), role: 'admin' }, env.JWT_SECRET);

    const cand = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Candidate', email: 'cand@test.local', password: 'Password@123' });
    candidateToken = cand.body.accessToken;
  });

  it('blocks non-admin from admin users endpoint (403)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows admin to list users and analytics', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(usersRes.status).toBe(200);
    expect(usersRes.body).toHaveProperty('items');

    const analyticsRes = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(analyticsRes.status).toBe(200);
    expect(analyticsRes.body).toHaveProperty('users');
    expect(analyticsRes.body).toHaveProperty('avgAtsScore');
  });

  it('allows admin to manage skills taxonomy', async () => {
    const createRes = await request(app)
      .post('/api/admin/skills')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'RustLang',
        aliases: ['rust'],
        category: 'language'
      });

    expect(createRes.status).toBe(201);
    const skillId = createRes.body.skill._id;

    const deleteRes = await request(app)
      .delete(`/api/admin/skills/${skillId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('prevents admin from removing their own admin role', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'candidate'
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN_SELF_DEMOTION');
  });
});

