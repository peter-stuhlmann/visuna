import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
// import saveLog from '@/components/logs/saveLog';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const formsCollection = db.collection('forms');

  try {
    // Anfrage-Daten (Formularname und Formular-Slug) abrufen
    const { name, slug } = await req.json();

    // Sicherstellen, dass `name` und `slug` übergeben wurden und gültige Strings sind
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Formularname ist erforderlich.' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { message: 'Formular-Slug ist erforderlich.' },
        { status: 400 }
      );
    }

    // Überprüfen, ob der `slug` bereits in der Datenbank existiert
    const existingForm = await formsCollection.findOne({ slug });

    if (existingForm) {
      return NextResponse.json(
        { message: 'Der Formular-Slug ist bereits vergeben.' },
        { status: 400 }
      );
    }

    // Neues Formular-Dokument erstellen
    const newFormDocument = {
      name,
      slug,
      createdAt: new Date().toISOString(),
      published: false,
    };

    // Dokument in die Sammlung einfügen
    const insertResult = await formsCollection.insertOne(newFormDocument);

    if (insertResult.acknowledged) {
      const newForm = await formsCollection.findOne({
        _id: insertResult.insertedId,
      });

      if (!newForm) {
        return NextResponse.json(
          { message: 'Fehler: Formular konnte nicht gefunden werden.' },
          { status: 500 }
        );
      }

      // await saveLog(
      //   `Formular "${newForm.name}" mit dem Slug "${newForm.slug}" wurde erstellt.`
      // );

      // Erfolgsantwort mit dem `slug` des neuen Dokuments zurückgeben
      return NextResponse.json(
        {
          message: 'Formular erfolgreich gespeichert.',
          newForm: newForm,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Fehler beim Speichern des Formulars.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Einfügen des Formulars:', error);
    return NextResponse.json(
      { message: 'Fehler beim Einfügen des Formulars.' },
      { status: 500 }
    );
  }
};
