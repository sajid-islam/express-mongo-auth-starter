import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@crkatgcluster.6ogfclp.mongodb.net/CrackAnythingDB?appName=CrkAtgCluster`;

  try {
    await mongoose.connect(uri);
    console.log('MONGODB CONNECTED SUCCESSFULLY');
  } catch (error) {
    console.log('Error on connecting mongodb -', error);
  }
};
