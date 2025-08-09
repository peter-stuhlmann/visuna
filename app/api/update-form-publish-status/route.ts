import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const formsCollection = db.collection('forms');

  try {
    const { slug, published } = await req.json();

    // Validierung: `key` und `published` müssen vorhanden und gültig sein
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { message: 'Formular-Slug ist erforderlich.' },
        { status: 400 }
      );
    }

    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { message: 'Der Veröffentlichungsstatus muss ein Boolean sein.' },
        { status: 400 }
      );
    }

    // Formular anhand des `key` finden und den Veröffentlichungsstatus aktualisieren
    const updateResult = await formsCollection.updateOne(
      { slug },
      { $set: { published } }
    );

    // Prüfen, ob ein Dokument aktualisiert wurde
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Kein Formular mit diesem Slug gefunden.' },
        { status: 404 }
      );
    }

    if (updateResult.modifiedCount > 0) {
      return NextResponse.json(
        { message: 'Veröffentlichungsstatus erfolgreich aktualisiert.' },
        { status: 200 }
      );
    }

    // Falls nichts geändert wurde
    return NextResponse.json(
      { message: 'Veröffentlichungsstatus war bereits gesetzt.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Fehler beim Aktualisieren des Veröffentlichungsstatus:',
      error
    );
    return NextResponse.json(
      { message: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
};
