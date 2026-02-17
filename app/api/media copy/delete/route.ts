// app/api/media/delete/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import connectToDatabase from '@/utils/connectToDatabase';

type MediaDoc = {
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function DELETE(req: Request) {
  try {
    const { public_id } = (await req.json()) as { public_id?: string };

    if (!public_id || typeof public_id !== 'string') {
      return NextResponse.json(
        { error: 'No public_id provided' },
        { status: 400 }
      );
    }

    // 1) Aus Cloudinary löschen
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== 'ok') {
      console.error('Cloudinary delete failed:', result);
      return NextResponse.json(
        { error: 'Cloudinary delete failed', details: result },
        { status: 500 }
      );
    }

    // 2) Metadaten aus Mongo löschen (falls DB konfiguriert)
    const dbName = process.env.DB_NAME;

    if (!dbName) {
      console.warn(
        'DB_NAME not set – media document for',
        public_id,
        'will NOT be deleted from Mongo.'
      );
    } else {
      try {
        const { db } = await connectToDatabase(dbName);
        const collection = db.collection<MediaDoc>('media');

        await collection.deleteOne({ publicId: public_id });
      } catch (mongoError) {
        // Cloudinary-Löschung war erfolgreich, Mongo-Fehler loggen wir nur
        console.error(
          'Mongo delete failed for media document with publicId:',
          public_id,
          mongoError
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
