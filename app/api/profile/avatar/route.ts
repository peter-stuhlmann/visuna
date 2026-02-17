import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import cloudinary from '@/utils/cloudinary';
import connectToDatabase from '@/utils/connectToDatabase';

if (!process.env.DB_NAME) throw new Error('DB_NAME is not defined');

// Extend API route timeout to 30s (default is ~5s)
export const maxDuration = 30;

/**
 * POST /api/profile/avatar
 * Uploads a profile picture to Cloudinary (folder: users/<email-hash>)
 * and stores the URL as `avatarUrl` on the user document.
 *
 * Body: FormData with field "file" (image).
 */
export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Keine gültige Bilddatei' },
      { status: 400 }
    );
  }

  // Max 5 MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Datei zu groß (max. 5 MB)' },
      { status: 400 }
    );
  }

  try {
    // Convert file to base64 data URI for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary in users/ folder
    const emailHash = session.user.email
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'users',
      public_id: `avatar_${emailHash}`,
      overwrite: true,
      timeout: 30000,
    });

    // Store the raw URL — transformations are applied on-the-fly via getAvatarUrl()
    const avatarUrl = result.secure_url;

    // Update user document in MongoDB
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    await db.collection('users').updateOne(
      { email: { $regex: `^${session.user.email}$`, $options: 'i' } },
      { $set: { avatarUrl } }
    );

    return NextResponse.json({ avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen' },
      { status: 500 }
    );
  }
}
