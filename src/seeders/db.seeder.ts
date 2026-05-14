import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.ts';
import { seedPermission } from './permission.seeder.ts';
import { seedRole } from './role.seeder.ts';
import { seedUsers } from './user.seeder.ts';
configDotenv();

const seedDb = async () => {
  try {
    await connectDB();
    await seedPermission();
    await seedRole();
    await seedUsers();

    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

seedDb();
