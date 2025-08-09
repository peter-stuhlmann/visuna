import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import saveLog from '@/components/logs/saveLog';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const formsCollection = db.collection('forms');

  try {
    const { id } = await req.json();

    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Eine gültige Formular-ID ist erforderlich.' },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(id);

    // Formular mit der ID finden, um den Key zu extrahieren
    const form = await formsCollection.findOne({ _id: objectId });

    if (!form) {
      return NextResponse.json(
        { message: 'Kein Formular mit dieser ID gefunden.' },
        { status: 404 }
      );
    }

    const { key, name } = form;

    // Formular löschen
    const deleteResult = await formsCollection.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Fehler beim Löschen des Formulars.' },
        { status: 500 }
      );
    }

    await saveLog(`Formular "${name}" mit dem Key "${key}" wurde gelöscht.`);

    return NextResponse.json(
      { message: 'Formular erfolgreich gelöscht.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Löschen des Formulars:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Formulars.' },
      { status: 500 }
    );
  }
};
