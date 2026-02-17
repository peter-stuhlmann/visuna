// app/api/media/list/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import connectToDatabase from '@/utils/connectToDatabase';

// dieselben Typen wie in /api/media/update
type MediaLocalizedField = Record<string, string>;

type MediaMeta = {
  alt?: MediaLocalizedField;
  title?: MediaLocalizedField;
  caption?: MediaLocalizedField;
  copyright?: MediaLocalizedField;
};

type MediaDoc = {
  publicId: string;
  meta?: MediaMeta;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET() {
  try {
    // 1) Ressourcen aus Cloudinary holen
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'mediapool/',
      max_results: 50,
      context: true,
    });

    const resources = (result.resources ?? []) as Array<{
      public_id: string;
      [key: string]: unknown;
    }>;

    const publicIds = resources.map((r) => r.public_id);

    // Falls keine Bilder vorhanden → direkt zurück
    if (publicIds.length === 0) {
      return NextResponse.json(result);
    }

    const dbName = process.env.DB_NAME;

    // Wenn keine DB konfiguriert ist, liefern wir einfach nur Cloudinary zurück
    if (!dbName) {
      console.warn('DB_NAME not set – returning Cloudinary resources only.');
      return NextResponse.json(result);
    }

    // 2) Zu den publicIds passende Dokumente aus Mongo holen
    const { db } = await connectToDatabase(dbName);
    const collection = db.collection<MediaDoc>('media');

    const docs = await collection
      .find({ publicId: { $in: publicIds } })
      .toArray();

    const metaById = new Map<string, MediaMeta>();
    docs.forEach((doc) => {
      if (doc.meta) {
        metaById.set(doc.publicId, doc.meta);
      }
    });

    // 3) Meta aus Mongo an die Cloudinary-Objekte dranmergen
    const mergedResources = resources.map((r) => {
      const mongoMeta = metaById.get(r.public_id);
      if (!mongoMeta) return r;

      return {
        ...r,
        // neues Feld "meta" für mehrsprachige Metadaten
        meta: mongoMeta,
      };
    });

    // 4) Ergebnis mit gemergten Ressourcen zurückgeben
    const responsePayload = {
      ...result,
      resources: mergedResources,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Listing failed' }, { status: 500 });
  }
}
