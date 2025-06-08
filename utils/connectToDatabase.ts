import { MongoClient } from 'mongodb';

const MONGO_DB_URI = process.env.MONGO_DB_URI as string;

const client = new MongoClient(MONGO_DB_URI);

const connectToDatabase = async (dbName: string) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export default connectToDatabase;
