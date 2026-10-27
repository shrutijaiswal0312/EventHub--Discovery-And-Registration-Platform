const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const User = require('../src/models/User');

setupTestDB();

describe('Authentication & Authorization Test Suite', () => {
  // Test Case 1: Successful participant registration
  it('1. should successfully register a participant', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Participant',
        email: 'alice@example.com',
        password: 'Password123!',
        role: 'participant'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.role).toBe('participant');
    expect(res.body.user.password).toBeUndefined();
  });

  // Test Case 2: Successful organizer registration
  it('2. should successfully register an organizer according to role policy', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Organizer',
        email: 'bob@example.com',
        password: 'Password123!',
        role: 'organizer'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('organizer');
  });

  // Test Case 3: Duplicate email rejection
  it('3. should reject registration with a duplicate email', async () => {
    await User.create({
      name: 'Existing User',
      email: 'dup@example.com',
      password: 'Password123!',
      role: 'participant'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'dup@example.com',
        password: 'Password123!',
        role: 'participant'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // Test Case 4: Invalid login rejection
  it('4. should reject login with invalid credentials', async () => {
    await User.create({
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'Password123!',
      role: 'participant'
    });

    // Wrong password
    const resWrongPass = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'valid@example.com',
        password: 'WrongPassword999!'
      });

    expect(resWrongPass.status).toBe(401);
    expect(resWrongPass.body.success).toBe(false);

    // Non-existent email
    const resNoUser = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!'
      });

    expect(resNoUser.status).toBe(401);
    expect(resNoUser.body.success).toBe(false);
  });

  // Test Case 5: Unauthenticated access rejection
  it('5. should reject unauthenticated access to protected endpoints', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test Case 6: Unauthorized role access rejection
  it('6. should reject unauthorized role access to organizer endpoints by participant', async () => {
    // Register participant
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Participant Guy',
        email: 'part@example.com',
        password: 'Password123!',
        role: 'participant'
      });

    const participantToken = registerRes.body.token;

    // Participant tries to access organizer events
    const res = await request(app)
      .get('/api/organizer/events')
      .set('Authorization', `Bearer ${participantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Access denied/i);
  });
});
