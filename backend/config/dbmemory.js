const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  try {
    // Always use in-memory MongoDB for now
    console.log("Using NodeJS below 20.19.0");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log("In-Memory MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error disconnecting:", err.message);
  }
};

module.exports = { connectDB, disconnectDB };
