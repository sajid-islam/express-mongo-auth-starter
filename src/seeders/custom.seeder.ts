import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.ts';
import User from '../models/User.ts';
import { seedUsers } from './user.seeder.ts';

configDotenv();
const customSeed = async () => {
  try {
    await connectDB();

    /*
     --------------------------------------------------------------------------
      Custom Seeders
     --------------------------------------------------------------------------
     
      Add one or multiple seeders here and run:
      npm run custom:seed
     
      IMPORTANT:
      If you are using multiple seeders, ensure they are executed
      in the correct dependency order.
     
      Example:
      PermissionsSeeder -> RolesSeeder -> UsersSeeder
    */
    await User.deleteMany();
    await seedUsers();

    console.log('customSeed() run successfully');

    mongoose.connection.close();
  } catch (error) {
    console.log('Error while running customSeed()', error);
  }
};

customSeed();
