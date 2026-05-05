import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = `${process.env.MONGODB_URI}`;

  try {
    await mongoose.connect(uri);
    console.log('MONGODB CONNECTED SUCCESSFULLY');
  } catch (error) {
    console.log('Error on connecting mongodb -', error);
  }
};
