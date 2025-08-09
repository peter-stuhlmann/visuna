import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';
import { PageElementData } from '@/components/content-elements/default/types';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pageElementsCollection = db.collection('pageElements');

  try {
    const { id, data }: { id: string; data: PageElementData } =
      await req.json();

    console.log('Update Page Element Request:', { id, data });

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { message: 'Fehlende oder ungültige ID.' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { message: 'Ungültige oder fehlende Daten.' },
        { status: 400 }
      );
    }

    const result = await pageElementsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { data } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Kein Element aktualisiert.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Seitenelement erfolgreich aktualisiert.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Seitenelements:', error);
    return NextResponse.json(
      { message: 'Serverfehler beim Update.' },
      { status: 500 }
    );
  }
};
