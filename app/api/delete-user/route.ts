import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const usersCollection = db.collection('users');

  try {
    const { email } = await req.json();

    // Sicherstellen, dass eine E-Mail vorhanden ist
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required.' },
        { status: 400 }
      );
    }

    // Lösche den Benutzer auch aus der usersCollection anhand der E-Mail, falls vorhanden
    const userResult = await usersCollection.deleteOne({ email });

    // Überprüfen, ob der Benutzer in der usersCollection gelöscht wurde
    if (userResult.deletedCount > 0) {
      const updatedUsers = await usersCollection.find({}).toArray();

      return NextResponse.json(
        {
          message: 'User successfully deleted from usersCollection.',
          userDeleted:
            userResult.deletedCount > 0
              ? 'User also deleted from usersCollection.'
              : 'User not found in usersCollection (no deletion).',
          updatedUsers,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'User not found in usersCollection.' },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Error deleting user.' },
      { status: 500 }
    );
  }
};
