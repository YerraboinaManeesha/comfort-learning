// db.js — MongoDB connection.
require('dotenv').config();
const mongoose = require('mongoose');

let memoryServer = null; // keeps a reference so we can stop it cleanly on shutdown

async function connectDB() {
  if (process.env.MONGODB_URI) {
    // A real connection string was provided — use it, and data will persist.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB at', process.env.MONGODB_URI);
    return { persistent: true };
  }

  // No MONGODB_URI set — start a real, self-contained in-memory MongoDB.
  // (mongodb-memory-server downloads a small MongoDB binary the first
  // time this runs, which needs an internet connection once. After that
  // it's cached locally and starts instantly, fully offline.)
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to an in-memory MongoDB instance (no setup required).');
  console.log('Note: this data resets whenever the server restarts.');
  console.log('To use a persistent database instead, set MONGODB_URI in your .env file.');
  return { persistent: false };
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
