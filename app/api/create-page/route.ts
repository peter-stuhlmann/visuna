import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import saveLog from '@/components/logs/saveLog';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection('pages');

  try {
    // Anfrage-Daten (Seitenname und Seiten-slug) abrufen
    const { name, slug } = await req.json();

    // Sicherstellen, dass `name` und `slug` übergeben wurden und gültige Strings sind
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Seitenname ist erforderlich.' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { message: 'Slug ist erforderlich.' },
        { status: 400 }
      );
    }

    // Überprüfen, ob der `slug` bereits in der Datenbank existiert
    const existingPage = await pagesCollection.findOne({ slug });

    if (existingPage) {
      return NextResponse.json(
        { message: 'Der Slug ist bereits vergeben.' },
        { status: 400 }
      );
    }

    // Neues Seiten-Dokument erstellen
    const newPageDocument = {
      name,
      slug,
      createdAt: new Date().toISOString(),
      published: false,
      pageElements: [], // wichtig, damit $push später funktioniert!
    };

    // Dokument in die Sammlung einfügen
    const insertResult = await pagesCollection.insertOne(newPageDocument);

    if (insertResult.acknowledged) {
      const newPage = await pagesCollection.findOne({
        _id: insertResult.insertedId,
      });

      if (!newPage) {
        return NextResponse.json(
          { message: 'Fehler: Seite konnte nicht gefunden werden.' },
          { status: 500 }
        );
      }

      await saveLog(`Seite "${newPage.name}" wurde erstellt.`);

      // Erfolgsantwort mit dem `slug` des neuen Dokuments zurückgeben
      return NextResponse.json(
        {
          message: 'Seite erfolgreich gespeichert.',
          newPage: newPage,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Fehler beim Speichern der Seite.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Einfügen der Seite:', error);
    return NextResponse.json(
      { message: 'Fehler beim Einfügen der Seite.' },
      { status: 500 }
    );
  }
};
