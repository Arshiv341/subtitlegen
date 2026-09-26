const mongoose = require('mongoose');
const config = require('./config');

let isConnectedToMongo = false;

async function connectDB() {
  // If no URI or default local, attempt to connect with short timeout
  if (!config.mongodbUri) {
    console.log('[DB] No MONGODB_URI provided. Using local JSON repository fallback.');
    return false;
  }

  try {
    console.log(`[DB] Attempting MongoDB connection: ${config.mongodbUri.replace(/\/\/.*@/, '//***@')}...`);
    // 2.5 second timeout so app boots immediately even if mongod is not running
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    isConnectedToMongo = true;
    console.log('[DB] MongoDB successfully connected.');
    return true;
  } catch (err) {
    console.warn(`[DB] Could not connect to MongoDB (${err.message}).`);
    console.log('[DB] Falling back to robust local JSON file repository.');
    isConnectedToMongo = false;
    return false;
  }
}

function isMongoConnected() {
  return isConnectedToMongo && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isMongoConnected,
};
