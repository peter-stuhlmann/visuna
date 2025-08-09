// app/api/create-page-element/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const pagesCollection = db.collection('pages');
  const pageElementsCollection = db.collection('pageElements');

  try {
    const body = await req.json();
    const { pageId, element } = body;

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json(
        { message: 'Fehlende oder ungültige pageId.' },
        { status: 400 }
      );
    }

    if (!element || typeof element !== 'string') {
      return NextResponse.json(
        { message: 'Fehlendes oder ungültiges Element.' },
        { status: 400 }
      );
    }

    const newElement = {
      element,
      name: element,
      data: {},
      pageId: new ObjectId(pageId),
      createdAt: new Date(),
    };

    // In pageElements einfügen
    const insertResult = await pageElementsCollection.insertOne(newElement);
    const newElementId = insertResult.insertedId;

    // ID zur Seite hinzufügen
    await pagesCollection.updateOne(
      { _id: new ObjectId(pageId) },
      { $addToSet: { pageElements: newElementId } }
    );

    return NextResponse.json({ id: newElementId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Seitenelements:', error);
    return NextResponse.json(
      { message: 'Fehler beim Erstellen des Seitenelements.' },
      { status: 500 }
    );
  }
};
