import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection('pages');

  try {
    const { slug, published } = await req.json();

    // Validierung: `slug` und `published` müssen vorhanden und gültig sein
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { message: 'Slug ist erforderlich.' },
        { status: 400 }
      );
    }

    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { message: 'Der Veröffentlichungsstatus muss ein Boolean sein.' },
        { status: 400 }
      );
    }

    // Seite anhand des `slug` finden und den Veröffentlichungsstatus aktualisieren
    const updateResult = await pagesCollection.updateOne(
      { slug },
      { $set: { published } }
    );

    // Prüfen, ob ein Dokument aktualisiert wurde
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Keine Seite mit diesem slug gefunden.' },
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
