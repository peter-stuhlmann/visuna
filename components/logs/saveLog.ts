import { getServerSession } from 'next-auth/next';

const saveLog = async (activity: string): Promise<void> => {
  try {
    const session = await getServerSession();
    const email = session?.user?.email || '';

    if (!email) {
      console.error('E-Mail ist nicht verfügbar.');
      return;
    }

    await fetch(`${process.env.NEXTAUTH_URL}/api/create-log-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        activity: activity,
      }),
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Logs:', error);
  }
};

export default saveLog;
