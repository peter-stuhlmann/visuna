import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { GenericForm, sendDataByEmail } from './utils/sendDataByEmail';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const medicalHistoryFormCollection = db.collection('medicalHistoryForms');

  try {
    const { formData } = await req.json();

    // Suche nach der höchsten vorhandenen clientId in der 'medicalHistoryForms' Collection
    const highestClientId = await medicalHistoryFormCollection
      .find({})
      .sort({ clientId: -1 }) // Sortiere absteigend nach 'clientId'
      .limit(1) // Nimm nur das Dokument mit der höchsten Nummer
      .toArray();

    // Berechne die nächste Kundennummer
    let nextclientId = '10000'; // Standardmäßig '10000', falls keine Kunden vorhanden sind
    if (highestClientId.length > 0 && highestClientId[0].clientId) {
      nextclientId = (parseInt(highestClientId[0].clientId) + 1).toString();
    }

    // Timestamp und clientId zum formData hinzufügen
    const newUserEntry = {
      ...formData,
      createdAt: new Date().toISOString(),
      clientId: nextclientId, // Nächste Kundennummer
    };

    // Füge den neuen Eintrag in die Collection 'medicalHistoryForms' ein
    const insertResult = await medicalHistoryFormCollection.insertOne(
      newUserEntry
    );

    if (insertResult.acknowledged) {
      const insertedDocument = await medicalHistoryFormCollection.findOne({
        _id: insertResult.insertedId,
      });

      if (insertedDocument) {
        // Sende die Daten per E-Mail
        // Konvertiere das MongoDB-Dokument zu `GenericForm`
        const emailData: GenericForm = {
          ...insertedDocument,
          _id: undefined,
          clientId: insertedDocument.clientId,
          createdAt: insertedDocument.createdAt,
          signature: insertedDocument.signature,
        };

        await sendDataByEmail(emailData);

        return NextResponse.json(
          {
            message: 'Data saved successfully.',
            name: insertedDocument.name,
            clientId: insertedDocument.clientId,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: 'Error verifying the saved data.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          message: 'An error occurred when saving the user data.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json(
      { message: 'Error inserting data.' },
      { status: 500 }
    );
  }
};
