// app/api/users/preferences/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';
import { UserDB, UserPreferences } from '@/lib/users/users.types';

/** GET – Return current user's preferences */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);
    const user = await db
      .collection<UserDB>('users')
      .findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ preferences: user.preferences ?? {} });
  } catch (err) {
    console.error('GET /api/users/preferences error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

/** PATCH – Shallow-merge incoming preferences into user document */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const incoming: Partial<UserPreferences> = await req.json();

    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json(
        { message: 'Invalid body' },
        { status: 400 }
      );
    }

    // Build $set with dot-notation so we shallow-merge instead of overwrite
    const setFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(incoming)) {
      setFields[`preferences.${key}`] = value;
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);
    await db
      .collection<UserDB>('users')
      .updateOne(
        { email: session.user.email },
        { $set: setFields }
      );

    return NextResponse.json({ message: 'Preferences updated' });
  } catch (err) {
    console.error('PATCH /api/users/preferences error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
