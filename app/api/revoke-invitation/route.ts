import { Workspace } from '@/types';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { id } = await req.json();

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { message: 'Ungültige Anfrage. Eine ID wird benötigt.' },
        { status: 400 }
      );
    }

    const userId = new ObjectId(id as string);
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');
    const workspacesCollection = db.collection<Workspace>('workspaces');

    // Prüfen, ob es sich um eine unverifizierte Einladung handelt
    const existingInvite = await usersCollection.findOne({
      _id: userId,
      verified: false,
    });

    if (!existingInvite) {
      return NextResponse.json(
        { message: 'Einladung nicht gefunden oder bereits verwendet.' },
        { status: 404 }
      );
    }

    // User aus der Datenbank löschen
    const result = await usersCollection.deleteOne({ _id: userId });

    if (result.deletedCount === 1) {
      await workspacesCollection.updateMany(
        { 'access.userId': id },
        { $pull: { access: { userId: id } } }
      );

      const users = await usersCollection.find({}).toArray();

      return NextResponse.json(
        {
          message: 'Einladung erfolgreich zurückgezogen.',
          updatedUsers: users,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Einladung konnte nicht gelöscht werden.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Zurückziehen der Einladung:', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
};
