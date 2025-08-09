import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const formsCollection = db.collection('forms');

  try {
    const { formId, formElements } = await req.json();

    if (!formId || typeof formId !== 'string') {
      return NextResponse.json(
        { message: 'Ein gültiger formId ist erforderlich.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(formElements)) {
      return NextResponse.json(
        { message: 'Formularelemente müssen ein Array sein.' },
        { status: 400 }
      );
    }

    const objectFormId = new ObjectId(formId);

    // Füge das Formular (oder die Formularelemente) hinzu oder aktualisiere es
    await formsCollection.updateOne(
      { _id: objectFormId },
      { $set: { formElements } },
      { upsert: true }
    );

    return NextResponse.json(
      { message: 'Formularelemente erfolgreich gespeichert.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Speichern der Formularelemente:', error);
    return NextResponse.json(
      { message: 'Fehler beim Speichern der Formularelemente.' },
      { status: 500 }
    );
  }
};
