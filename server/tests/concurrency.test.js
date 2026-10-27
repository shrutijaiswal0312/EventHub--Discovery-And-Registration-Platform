const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Registration = require('../src/models/Registration');

setupTestDB();

describe('Concurrency & Capacity Safety Test Suite', () => {
  it('should prevent overbooking when multiple participants register simultaneously against limited capacity', async () => {
    // 1. Create an organizer
    const organizer = await User.create({
      name: 'Concurrency Organizer',
      email: 'concurrent.org@example.com',
      password: 'Password123!',
      role: 'organizer'
    });

    // 2. Create limited capacity event: capacity = 3
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const event = await Event.create({
      title: 'High-Demand Flash Workshop',
      description: 'Strict limit of 3 attendees.',
      category: 'Workshop',
      date: futureDate,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      location: 'Lab 404',
      capacity: 3,
      registeredCount: 0,
      organizer: organizer._id,
      status: 'published'
    });

    // 3. Create 10 distinct participants and login to get 10 tokens
    const participantCount = 10;
    const participantTokens = [];

    for (let i = 1; i <= participantCount; i++) {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: `Racer ${i}`,
          email: `racer${i}@example.com`,
          password: 'Password123!',
          role: 'participant'
        });
      participantTokens.push(regRes.body.token);
    }

    expect(participantTokens.length).toBe(10);

    // 4. Fire 10 simultaneous registration requests at the exact same time
    const registrationPromises = participantTokens.map((token) =>
      request(app)
        .post(`/api/events/${event._id}/register`)
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(registrationPromises);

    // 5. Verify results
    const successful = responses.filter((r) => r.status === 201);
    const rejected = responses.filter((r) => r.status === 400);

    expect(successful.length).toBe(3);
    expect(rejected.length).toBe(7);

    // Verify rejection messages indicate full capacity
    rejected.forEach((r) => {
      expect(r.body.success).toBe(false);
      expect(r.body.message).toMatch(/full capacity/i);
    });

    // 6. Verify MongoDB persistence consistency
    const finalEvent = await Event.findById(event._id);
    expect(finalEvent.registeredCount).toBe(3);

    const totalActiveRegistrations = await Registration.countDocuments({
      event: event._id,
      status: 'registered'
    });
    expect(totalActiveRegistrations).toBe(3);
  });
});
