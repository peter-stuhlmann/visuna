import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import saveLog from '@/components/logs/saveLog';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection('pages');

  try {
    const { id } = await req.json();

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Eine gültige Seiten-ID ist erforderlich.' },
        { status: 400 }
      );
    }
    const objectId = new ObjectId(id);

    // Seite mit der ID finden, um den slug zu extrahieren
    const page = await pagesCollection.findOne({ _id: objectId });

    if (!page) {
      return NextResponse.json(
        { message: 'Keine Seite mit dieser ID gefunden.' },
        { status: 404 }
      );
    }

    const { name } = page;

    // Seite löschen
    const deleteResult = await pagesCollection.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Fehler beim Löschen der Seite.' },
        { status: 500 }
      );
    }

    await saveLog(`Seite "${name}" wurde gelöscht.`);

    return NextResponse.json(
      { message: 'Seite erfolgreich gelöscht.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Löschen der Seite:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen der Seite.' },
      { status: 500 }
    );
  }
};
