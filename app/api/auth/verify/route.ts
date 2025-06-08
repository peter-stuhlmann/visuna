import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { message: 'This link is invalid.' },
        { status: 404 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);

    const result = await db.collection('users').findOneAndUpdate(
      {
        verificationCode: code,
        expiresAt: { $gte: new Date() },
      },
      {
        $set: { verified: true },
        $unset: { verificationCode: '', expiresAt: '' },
      },
      {
        returnDocument: 'after',
      }
    );

    const email = result?.email;

    if (email) {
      await db
        .collection('users')
        .updateOne({ email: email }, { $set: { verified: true } });

      return NextResponse.json(
        { message: 'You have been successfully verified.' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'The code has expired or is invalid.' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { message: 'An unexpected error occurred.' },
        { status: 500 }
      );
    }
  }
};
