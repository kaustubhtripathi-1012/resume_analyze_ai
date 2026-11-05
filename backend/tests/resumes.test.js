const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

describe('Resumes API', () => {
  let token1, token2;

  beforeEach(async () => {
    const reg1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: 'user1@example.com', password: 'Password@123' });
    token1 = reg1.body.accessToken;

    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'user2@example.com', password: 'Password@123' });
    token2 = reg2.body.accessToken;
  });

  it('rejects an executable disguised as a PDF (magic byte check)', async () => {
    // Create dummy fake PDF file with EXE magic bytes 'MZ' (0x4D, 0x5A)
    const fakeFilePath = path.join(__dirname, 'fake.pdf');
    fs.writeFileSync(fakeFilePath, Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]));

    const res = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token1}`)
      .attach('file', fakeFilePath);

    try {
      fs.unlinkSync(fakeFilePath);
    } catch (e) {}

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_CONTENT');
  });

  it('accepts a valid PDF with %PDF magic bytes', async () => {
    const validPdfPath = path.join(__dirname, 'valid.pdf');
    fs.writeFileSync(validPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'));

    const res = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token1}`)
      .attach('file', validPdfPath);

    try {
      fs.unlinkSync(validPdfPath);
    } catch (e) {}

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('resumeId');
    expect(res.body.status).toBe('parsing');
  });

  it('prevents unauthorized access to another candidate resume (403)', async () => {
    const validPdfPath = path.join(__dirname, 'valid.pdf');
    fs.writeFileSync(validPdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'));

    const uploadRes = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token1}`)
      .attach('file', validPdfPath);

    try {
      fs.unlinkSync(validPdfPath);
    } catch (e) {}

    const resumeId = uploadRes.body.resumeId;

    // User 2 tries to read User 1's resume
    const res = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

