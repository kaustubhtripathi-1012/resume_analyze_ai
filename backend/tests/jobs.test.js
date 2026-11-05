const request = require('supertest');
const app = require('../src/app');

describe('Jobs API', () => {
  let candidateToken, recruiterToken;

  beforeEach(async () => {
    const cand = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Candidate User', email: 'cand@example.com', password: 'Password@123', role: 'candidate' });
    candidateToken = cand.body.accessToken;

    const rec = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Recruiter User', email: 'rec@example.com', password: 'Password@123', role: 'recruiter' });
    recruiterToken = rec.body.accessToken;
  });

  it('prohibits candidate from posting a job (403)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        title: 'Backend Developer',
        company: 'Acme Corp',
        description: 'Great backend role requiring Node.js.',
        requiredSkills: ['Node.js']
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows recruiter to post a new job (201)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Full Stack Developer',
        company: 'Tech Solutions',
        description: 'Building modern React and Node.js applications with agile delivery.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        location: 'Remote',
        experienceLevel: 'junior'
      });

    expect(res.status).toBe(201);
    expect(res.body.job.title).toBe('Full Stack Developer');
  });

  it('lists active jobs with pagination', async () => {
    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Python Engineer',
        company: 'AI Corp',
        description: 'Python and FastAPI engineering role.',
        requiredSkills: ['Python', 'FastAPI']
      });

    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });
});

