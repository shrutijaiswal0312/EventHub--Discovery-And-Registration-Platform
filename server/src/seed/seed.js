const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { getSeedData } = require('./seedData');

const runSeed = async () => {
  try {
    console.log('🌱 Starting EventHub Database Seeding...');
    await connectDB();

    // Clear existing collections safely
    console.log('🧹 Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({})
    ]);

    const { users: rawUsers, events: rawEvents } = getSeedData();

    // Create users (using save() or create() to trigger password hashing middleware)
    console.log('👤 Creating demo users...');
    const createdUsers = {};
    for (const u of rawUsers) {
      const userDoc = await User.create(u);
      createdUsers[userDoc.email] = userDoc;
    }

    const organizer1 = createdUsers['organizer@eventhub.com'];
    const organizer2 = createdUsers['sarah.organizer@eventhub.com'];
    const participantJohn = createdUsers['john@example.com'];
    const participantEmma = createdUsers['emma@example.com'];
    const participantMichael = createdUsers['michael@example.com'];
    const participantSophia = createdUsers['sophia@example.com'];

    // Insert events with assigned organizers
    console.log('📅 Inserting demo events...');
    const createdEvents = [];
    for (let i = 0; i < rawEvents.length; i++) {
      const evData = rawEvents[i];
      // Alternate organizers
      const assignedOrganizer = i % 2 === 0 ? organizer1 : organizer2;
      const evDoc = await Event.create({
        ...evData,
        organizer: assignedOrganizer._id,
        registeredCount: 0
      });
      createdEvents.push(evDoc);
    }

    // Now seed realistic registrations and update registeredCount accurately
    console.log('🎟️ Seeding registration records...');
    const [
      aiSummit,
      fullWorkshop,
      startupPitch,
      designWebinar,
      cancelledCrypto,
      completedEdu,
      networkingMixer
    ] = createdEvents;

    // 1. Full Workshop (Capacity: 3 -> 3 registered: John, Emma, Michael)
    await Registration.create([
      { participant: participantJohn._id, event: fullWorkshop._id, status: 'registered', registeredAt: new Date(Date.now() - 3 * 86400000) },
      { participant: participantEmma._id, event: fullWorkshop._id, status: 'registered', registeredAt: new Date(Date.now() - 2 * 86400000) },
      { participant: participantMichael._id, event: fullWorkshop._id, status: 'registered', registeredAt: new Date(Date.now() - 1 * 86400000) }
    ]);
    fullWorkshop.registeredCount = 3;
    await fullWorkshop.save();

    // 2. AI Summit (Capacity 50 -> John (registered), Sophia (registered), Emma (cancelled))
    await Registration.create([
      { participant: participantJohn._id, event: aiSummit._id, status: 'registered', registeredAt: new Date(Date.now() - 4 * 86400000) },
      { participant: participantSophia._id, event: aiSummit._id, status: 'registered', registeredAt: new Date(Date.now() - 3 * 86400000) },
      { participant: participantEmma._id, event: aiSummit._id, status: 'cancelled', registeredAt: new Date(Date.now() - 5 * 86400000), cancelledAt: new Date(Date.now() - 1 * 86400000) }
    ]);
    aiSummit.registeredCount = 2; // Emma cancelled, so registeredCount is 2
    await aiSummit.save();

    // 3. Startup Pitch Night (Capacity 25 -> Emma (registered))
    await Registration.create([
      { participant: participantEmma._id, event: startupPitch._id, status: 'registered', registeredAt: new Date(Date.now() - 2 * 86400000) }
    ]);
    startupPitch.registeredCount = 1;
    await startupPitch.save();

    // 4. Design Systems Webinar (Capacity 100 -> John (registered), Michael (registered))
    await Registration.create([
      { participant: participantJohn._id, event: designWebinar._id, status: 'registered', registeredAt: new Date(Date.now() - 2 * 86400000) },
      { participant: participantMichael._id, event: designWebinar._id, status: 'registered', registeredAt: new Date(Date.now() - 1 * 86400000) }
    ]);
    designWebinar.registeredCount = 2;
    await designWebinar.save();

    // 5. Cancelled Crypto Colloquium (Sophia registered prior to cancellation)
    await Registration.create([
      { participant: participantSophia._id, event: cancelledCrypto._id, status: 'registered', registeredAt: new Date(Date.now() - 6 * 86400000) }
    ]);
    cancelledCrypto.registeredCount = 1;
    await cancelledCrypto.save();

    // 6. Completed Edu Forum (John and Emma registered)
    await Registration.create([
      { participant: participantJohn._id, event: completedEdu._id, status: 'registered', registeredAt: new Date(Date.now() - 15 * 86400000) },
      { participant: participantEmma._id, event: completedEdu._id, status: 'registered', registeredAt: new Date(Date.now() - 14 * 86400000) }
    ]);
    completedEdu.registeredCount = 2;
    await completedEdu.save();

    console.log('✅ EventHub database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials Summary:');
    console.log('  Organizer 1:   organizer@eventhub.com      / Password123!');
    console.log('  Organizer 2:   sarah.organizer@eventhub.com / Password123!');
    console.log('  Participant 1: john@example.com            / Password123!');
    console.log('  Participant 2: emma@example.com            / Password123!');
    console.log('  Participant 3: michael@example.com         / Password123!');
    console.log('  Participant 4: sophia@example.com          / Password123!');
    console.log('--------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

runSeed();
