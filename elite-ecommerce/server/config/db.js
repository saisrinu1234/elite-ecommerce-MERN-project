const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elite_ecommerce';
  const useMemory = process.env.USE_MEMORY_DB || 'auto';

  if (useMemory === 'true') {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error('[Database] Failed to start In-Memory MongoDB:', err.message);
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${uri} (${error.message})`);
    
    if (useMemory === 'auto') {
      console.log('[Database] Attempting fallback to In-Memory MongoDB for local development/testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] Fallback In-Memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] In-Memory MongoDB fallback failed:', memErr.message);
        throw error;
      }
    } else {
      throw error;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
