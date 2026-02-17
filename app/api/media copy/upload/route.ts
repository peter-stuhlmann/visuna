// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import connectToDatabase from '@/utils/connectToDatabase';

type MediaMeta = {
  alt?: Record<string, string>;
  title?: Record<string, string>;
  caption?: Record<string, string>;
  copyright?: Record<string, string>;
};

type MediaDoc = {
  publicId: string;
  secureUrl: string;
  url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  meta: MediaMeta;
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'mediapool',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload failed'));
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    // --- Mongo-Eintrag (Basisdaten) anlegen/aktualisieren ---
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const collection = db.collection<MediaDoc>('media');
    const now = new Date();

    await collection.updateOne(
      { publicId: result.public_id },
      {
        $setOnInsert: {
          publicId: result.public_id,
          secureUrl: result.secure_url ?? '',
          url: result.secure_url ?? '',
          width: typeof result.width === 'number' ? result.width : null,
          height: typeof result.height === 'number' ? result.height : null,
          format: result.format ?? null,
          meta: {
            alt: {},
            title: {},
            caption: {},
            copyright: {},
          },
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      secure_url: result.secure_url,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
