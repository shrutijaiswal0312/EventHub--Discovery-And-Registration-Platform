const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Registration = require('../src/models/Registration');

setupTestDB();

describe('Event Management & Ownership Test Suite', () => {
  let organizerA;
  let organizerB;
  let tokenA;
  let tokenB;

  beforeEach(async () => {
    // Create Organizer A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Organizer Alpha',
        email: 'alpha@example.com',
        password: 'Password123!',
        role: 'organizer'
      });
    organizerA = resA.body.user;
    tokenA = resA.body.token;

    // Create Organizer B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Organizer Beta',
        email: 'beta@example.com',
        password: 'Password123!',
        role: 'organizer'
      });
    organizerB = resB.body.user;
    tokenB = resB.body.token;
  });

  // Test Case 7: Event creation
  it('7. should allow an organizer to create an event successfully', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Tech Innovation Expo',
        description: 'Comprehensive tech expo covering modern software paradigms.',
        category: 'Technology',
        date: futureDate.toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        location: 'Silicon Convention Center',
        eventType: 'offline',
        capacity: 100
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event.title).toBe('Tech Innovation Expo');
    expect(res.body.event.organizer._id).toBe(organizerA.id);
    expect(res.body.event.status).toBe('published');
    expect(res.body.event.registeredCount).toBe(0);
  });

  // Test Case 8: Organizer ownership enforcement
  it('8. should prevent an organizer from modifying another organizer event', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Alpha Only Workshop',
        description: 'Exclusive event organized by alpha organizer.',
        category: 'Workshop',
        date: futureDate.toISOString().split('T')[0],
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        location: 'Room 101',
        eventType: 'offline',
        capacity: 50
      });

    const eventId = createRes.body.event._id;

    // Organizer B tries to edit Organizer A's event
    const editRes = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        title: 'Hacked by Beta'
      });

    expect(editRes.status).toBe(403);
    expect(editRes.body.success).toBe(false);

    // Organizer B tries to cancel Organizer A's event
    const cancelRes = await request(app)
      .patch(`/api/events/${eventId}/cancel`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body.success).toBe(false);
  });

  // Test Case 9: Event editing
  it('9. should allow event owner to edit event details', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Initial Title',
        description: 'Initial description of the technical session.',
        category: 'Conference',
        date: futureDate.toISOString().split('T')[0],
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        location: 'Main Hall',
        capacity: 30
      });

    const eventId = createRes.body.event._id;

    const updateRes = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Updated Title Pro',
        location: 'Executive Auditorium B'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.event.title).toBe('Updated Title Pro');
    expect(updateRes.body.event.location).toBe('Executive Auditorium B');
  });

  // Test Case 10: Event cancellation
  it('10. should allow event owner to cancel an event', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Event To Cancel',
        description: 'This event will be cancelled by the owner.',
        category: 'Business',
        date: futureDate.toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        location: 'Online',
        capacity: 20
      });

    const eventId = createRes.body.event._id;

    const cancelRes = await request(app)
      .patch(`/api/events/${eventId}/cancel`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.event.status).toBe('cancelled');
  });

  // Test Case 18: Capacity reduction below active registrations rejected
  it('18. should reject capacity reduction below existing active registrations', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const event = await Event.create({
      title: 'Popular Tech Meetup',
      description: 'Popular event with active registrations.',
      category: 'Technology',
      date: futureDate,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      location: 'Tech Hub',
      capacity: 10,
      registeredCount: 5, // 5 active registrations
      organizer: organizerA.id,
      status: 'published'
    });

    // Try reducing capacity to 4 (which is less than 5)
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        capacity: 4
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Cannot reduce capacity to 4/i);
  });

  // Test Case 20: Invalid event ID and malformed input handling
  it('20. should handle invalid event ID and malformed inputs with 400 Bad Request', async () => {
    // Malformed ID
    const badIdRes = await request(app).get('/api/events/invalid-mongo-id-12345');
    expect(badIdRes.status).toBe(400);
    expect(badIdRes.body.success).toBe(false);

    // End time before start time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const badTimeRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Invalid Time Order Event',
        description: 'Event where end time precedes start time.',
        category: 'Technology',
        date: futureDate.toISOString().split('T')[0],
        startTime: '04:00 PM',
        endTime: '01:00 PM', // invalid: earlier than start
        location: 'Hall C',
        capacity: 20
      });

    expect(badTimeRes.status).toBe(400);
    expect(badTimeRes.body.success).toBe(false);
    expect(badTimeRes.body.message).toMatch(/End time must be later than start time/i);
  });
});
