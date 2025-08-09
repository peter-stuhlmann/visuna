import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const logsCollection = db.collection('activityLogs');

  try {
    const { email, activity } = await req.json();

    // Überprüfen, ob alle erforderlichen Parameter vorhanden sind
    if (!email || !activity) {
      return NextResponse.json(
        { message: 'Fehlende Parameter: email oder activity' },
        { status: 400 }
      );
    }

    // Log-Eintrag erstellen
    const logEntry = {
      email,
      activity,
      timestamp: new Date().toISOString(),
    };

    await logsCollection.insertOne(logEntry);

    return NextResponse.json(
      { message: 'Aktivität erfolgreich geloggt', logEntry },
      { status: 200 }
    );
  } catch (error) {
    let errorMessage = 'Unbekannter Fehler';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Fehler beim Speichern des Logs:', errorMessage);
    return NextResponse.json(
      { message: 'Fehler beim Speichern des Logs', error: errorMessage },
      { status: 500 }
    );
  }
};
