const request = require('supertest');
const app = require('../src/app');
const { setupTestDB } = require('./setup');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Registration = require('../src/models/Registration');

setupTestDB();

describe('Registration Lifecycle & Business Rules Test Suite', () => {
  let organizer;
  let participant1;
  let participant2;
  let tokenP1;
  let tokenP2;
  let tokenOrg;

  beforeEach(async () => {
    // Create Organizer
    const resOrg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Master Organizer',
        email: 'org@example.com',
        password: 'Password123!',
        role: 'organizer'
      });
    organizer = resOrg.body.user;
    tokenOrg = resOrg.body.token;

    // Create Participant 1
    const resP1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Participant One',
        email: 'p1@example.com',
        password: 'Password123!',
        role: 'participant'
      });
    participant1 = resP1.body.user;
    tokenP1 = resP1.body.token;

    // Create Participant 2
    const resP2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Participant Two',
        email: 'p2@example.com',
        password: 'Password123!',
        role: 'participant'
      });
    participant2 = resP2.body.user;
    tokenP2 = resP2.body.token;
  });

  // Test Case 11: Successful event registration
  it('11. should allow a participant to register for an event successfully', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Open Source Festival',
      description: 'Community gathering for open source enthusiasts.',
      category: 'Workshop',
      date: futureDate,
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      location: 'Community Center',
      capacity: 10,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    const res = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.registration.status).toBe('registered');
    expect(res.body.event.registeredCount).toBe(1);
    expect(res.body.event.remainingSeats).toBe(9);

    const updatedEventInDb = await Event.findById(event._id);
    expect(updatedEventInDb.registeredCount).toBe(1);
  });

  // Test Case 12: Duplicate registration prevention
  it('12. should reject duplicate active registration by the same participant', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Duplicate Check Seminar',
      description: 'Testing duplicate prevention rule.',
      category: 'Education',
      date: futureDate,
      startTime: '11:00 AM',
      endTime: '01:00 PM',
      location: 'Auditorium 2',
      capacity: 15,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    // First registration
    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    // Second registration attempt
    const dupRes = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.success).toBe(false);
    expect(dupRes.body.message).toMatch(/already actively registered/i);

    const eventInDb = await Event.findById(event._id);
    expect(eventInDb.registeredCount).toBe(1); // seat not doubled
  });

  // Test Case 13: Full-capacity registration rejection
  it('13. should reject registration when event capacity is reached', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    // Event with capacity 1
    const event = await Event.create({
      title: 'Single Seat Masterclass',
      description: 'Exclusive 1-person coaching session.',
      category: 'Education',
      date: futureDate,
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      location: 'Private Room',
      capacity: 1,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    // Participant 1 takes the only seat
    const res1 = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);
    expect(res1.status).toBe(201);

    // Participant 2 attempts to register for full event
    const res2 = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP2}`);

    expect(res2.status).toBe(400);
    expect(res2.body.success).toBe(false);
    expect(res2.body.message).toMatch(/full capacity/i);

    const eventInDb = await Event.findById(event._id);
    expect(eventInDb.registeredCount).toBe(1); // never exceeded 1
  });

  // Test Case 14: Seat release after cancellation
  it('14. should release seat and decrement count upon registration cancellation', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Cancellation Test Event',
      description: 'Verifying seat release mechanics.',
      category: 'Networking',
      date: futureDate,
      startTime: '06:00 PM',
      endTime: '08:00 PM',
      location: 'Roof Garden',
      capacity: 10,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    // Register
    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    // Cancel registration
    const cancelRes = await request(app)
      .delete(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.registration.status).toBe('cancelled');
    expect(cancelRes.body.event.registeredCount).toBe(0);
    expect(cancelRes.body.event.remainingSeats).toBe(10);

    const eventInDb = await Event.findById(event._id);
    expect(eventInDb.registeredCount).toBe(0);
  });

  // Test Case 15: Re-registration after cancellation
  it('15. should reactivate cancelled registration record rather than creating a duplicate', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Re-registration Lifecycle Event',
      description: 'Testing reactivation workflow.',
      category: 'Technology',
      date: futureDate,
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      location: 'Hall A',
      capacity: 5,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    // 1. Register
    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    // 2. Cancel
    await request(app)
      .delete(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    // 3. Re-register
    const reRegisterRes = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(reRegisterRes.status).toBe(201);
    expect(reRegisterRes.body.success).toBe(true);
    expect(reRegisterRes.body.registration.status).toBe('registered');

    // Verify exactly ONE registration document exists for this user-event pair
    const regDocs = await Registration.find({
      participant: participant1.id,
      event: event._id
    });
    expect(regDocs.length).toBe(1);
    expect(regDocs[0].status).toBe('registered');
  });

  // Test Case 16: Registration rejection for cancelled events
  it('16. should reject registration for an event with cancelled status', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Cancelled Summit',
      description: 'Cancelled summit description.',
      category: 'Conference',
      date: futureDate,
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      location: 'Hall B',
      capacity: 50,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'cancelled'
    });

    const res = await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cancelled and is not accepting registrations/i);
  });

  // Test Case 17: Registration rejection for completed or past events
  it('17. should reject registration for completed or past events', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const pastEvent = await Event.create({
      title: 'Historical Conference',
      description: 'Event that already ended in the past.',
      category: 'Education',
      date: pastDate,
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      location: 'Hall C',
      capacity: 30,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'completed'
    });

    const res = await request(app)
      .post(`/api/events/${pastEvent._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test Case 19: Participants cannot read another participant's registrations
  it('19. should ensure participants can only access their own registrations', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const event = await Event.create({
      title: 'Privacy Verification Event',
      description: 'Testing registration isolation.',
      category: 'Webinar',
      date: futureDate,
      startTime: '01:00 PM',
      endTime: '03:00 PM',
      location: 'Online',
      capacity: 10,
      registeredCount: 0,
      organizer: organizer.id,
      status: 'published'
    });

    // Participant 1 registers
    await request(app)
      .post(`/api/events/${event._id}/register`)
      .set('Authorization', `Bearer ${tokenP1}`);

    // Participant 2 fetches their registrations
    const resP2 = await request(app)
      .get('/api/registrations/my')
      .set('Authorization', `Bearer ${tokenP2}`);

    expect(resP2.status).toBe(200);
    expect(resP2.body.registrations.length).toBe(0); // Participant 2 cannot see Participant 1's registration

    // Participant 1 fetches their registrations
    const resP1 = await request(app)
      .get('/api/registrations/my')
      .set('Authorization', `Bearer ${tokenP1}`);

    expect(resP1.status).toBe(200);
    expect(resP1.body.registrations.length).toBe(1);
    expect(resP1.body.registrations[0].event._id).toBe(event._id.toString());
  });
});
