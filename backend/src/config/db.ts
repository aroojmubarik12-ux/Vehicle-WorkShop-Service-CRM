import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../models/User";
import { seedDatabase } from "../utils/seed";

let mongod: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vehicle_crm";
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB] Connected to external MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log(`[MongoDB] Local MongoDB on 27017 not available. Initializing embedded database...`);
    try {
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: "vehicle_crm"
        }
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Embedded MongoDB ready: ${memoryUri}`);
    } catch (memError) {
      console.error("[MongoDB] Failed to start embedded MongoDB:", memError);
      throw memError;
    }
  }

  // Check if database needs seeding
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("[MongoDB] Database is empty. Running initial seeder...");
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.error("[MongoDB Seeding Error]:", seedErr);
  }
};