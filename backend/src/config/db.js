import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evhub';
  const isDevOrTest = process.env.NODE_ENV !== 'production';

  try {
    // Set connection options
    mongoose.set('strictQuery', false);
    
    // Attempt standard connection with a short timeout in dev
    console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    console.log('[DB] MongoDB Connected Successfully.');
    return mongoose.connection;
  } catch (err) {
    console.warn(`[DB] External/Local MongoDB connection failed (${err.message}).`);

    if (isDevOrTest) {
      console.log('[DB] Initializing In-Memory MongoDB Server for local zero-config fallback...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        
        await mongoose.connect(memUri);
        console.log(`[DB] Connected to In-Memory MongoDB at: ${memUri}`);
        return mongoose.connection;
      } catch (memErr) {
        console.error('[DB] Failed to launch in-memory MongoDB fallback:', memErr);
        throw memErr;
      }
    } else {
      console.error('[DB] Critical: Cannot connect to MongoDB in production:', err);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('[DB] Error during disconnect:', error);
  }
};

