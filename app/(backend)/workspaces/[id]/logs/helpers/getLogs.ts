import { Log } from '@/components/logs/Logs.types';
import connectToDatabase from '@/utils/connectToDatabase';

const getLogs = async (): Promise<Log[] | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection('activityLogs');

  try {
    const logs = await collection.find({}).toArray();

    if (logs.length > 0) {
      const formattedForm = logs.map((form) => ({
        email: form.email,
        activity: form.activity,
        timestamp: form.timestamp,
      }));

      return formattedForm as Log[];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    return null;
  }
};

export default getLogs;
