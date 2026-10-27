const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

const TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/eventhub_test_db';

const setupTestDB = () => {
  beforeAll(async () => {
    await connectDB(TEST_URI);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });
};

module.exports = { setupTestDB };
