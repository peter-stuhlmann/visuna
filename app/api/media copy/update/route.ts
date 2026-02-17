// app/api/media/update/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import connectToDatabase from '@/utils/connectToDatabase';

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

type Body = {
  publicId: string;
  alt?: MediaLocalizedField;
  title?: MediaLocalizedField;
  caption?: MediaLocalizedField;
  copyright?: MediaLocalizedField;
};

// kleine Helper, um nur saubere Objekte zu speichern
function normalizeLocalizedField(
  value: unknown
): MediaLocalizedField | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const result: MediaLocalizedField = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim() !== '') {
      result[key] = v;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function buildMetaFromBody(body: Body): MediaMeta | undefined {
  const alt = normalizeLocalizedField(body.alt);
  const title = normalizeLocalizedField(body.title);
  const caption = normalizeLocalizedField(body.caption);
  const copyright = normalizeLocalizedField(body.copyright);

  const meta: MediaMeta = {};
  if (alt) meta.alt = alt;
  if (title) meta.title = title;
  if (caption) meta.caption = caption;
  if (copyright) meta.copyright = copyright;

  return Object.keys(meta).length > 0 ? meta : undefined;
}

// Ein Wert für Cloudinary: bevorzugt "de", sonst erster Eintrag
function primaryValue(field?: MediaLocalizedField): string | undefined {
  if (!field) return undefined;
  if (field.de && field.de.trim() !== '') return field.de;
  const first = Object.values(field).find((v) => v && v.trim() !== '');
  return first;
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { publicId } = body;

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'publicId is required' },
        { status: 400 }
      );
    }

    const meta = buildMetaFromBody(body);

    // --- 1) In MongoDB speichern (mehrsprachig) ---
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      console.error('DB_NAME is not set in environment variables');
    } else if (meta) {
      try {
        const { db } = await connectToDatabase(dbName);
        const collection = db.collection<MediaDoc>('media');
        const now = new Date();

        await collection.updateOne(
          { publicId },
          {
            $set: {
              meta,
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          { upsert: true }
        );
      } catch (dbErr) {
        console.error('Media update DB error:', dbErr);
      }
    }

    // --- 2) Cloudinary context.custom (nur einsprachiger Fallback) ---
    const context: Record<string, string> = {};
    if (meta?.alt) {
      const v = primaryValue(meta.alt);
      if (v) context.alt = v;
    }
    if (meta?.title) {
      const v = primaryValue(meta.title);
      if (v) context.title = v;
    }
    if (meta?.caption) {
      const v = primaryValue(meta.caption);
      if (v) context.caption = v;
    }
    if (meta?.copyright) {
      const v = primaryValue(meta.copyright);
      if (v) context.copyright = v;
    }

    if (Object.keys(context).length > 0) {
      try {
        await cloudinary.uploader.explicit(publicId, {
          type: 'upload',
          context,
        });
      } catch (cldErr) {
        console.error('Cloudinary context update error:', cldErr);
        // kein Hard-Fail – DB ist wichtiger, wir melden trotzdem ok=false
        return NextResponse.json({
          ok: true,
          cloudinaryContextUpdated: false,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      metaSaved: !!meta,
      cloudinaryContextUpdated: Object.keys(context).length > 0,
    });
  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
