import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { WithId, Document, ObjectId } from 'mongodb';

type FormElement = {
  order: number;
};

type FormDocument = WithId<Document> & {
  formId: string;
  formElements: FormElement[];
};

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const formsCollection = db.collection<FormDocument>('forms');

  try {
    const { formId, order } = await req.json();

    if (!formId) {
      return NextResponse.json(
        { message: 'Formular-ID ist erforderlich.' },
        { status: 400 }
      );
    }

    if (typeof order !== 'number') {
      return NextResponse.json(
        { message: 'Order ist erforderlich.' },
        { status: 400 }
      );
    }

    const objectFormId = new ObjectId(formId as string);

    const result = await formsCollection.updateOne(
      { _id: objectFormId },
      { $pull: { formElements: { order } } as unknown as Partial<FormDocument> }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Kein Formular-Element gefunden oder bereits gelöscht.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Formular-Element erfolgreich gelöscht.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Löschen des Formular-Elements:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Formular-Elements.' },
      { status: 500 }
    );
  }
};
