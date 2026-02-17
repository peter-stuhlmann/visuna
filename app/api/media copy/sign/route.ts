import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'mediapool' },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'mediapool',
    });
  } catch (err) {
    console.error('Sign API error:', err);
    return NextResponse.json({ error: 'Sign failed' }, { status: 500 });
  }
}
