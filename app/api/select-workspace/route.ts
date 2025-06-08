import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { getServerSession } from 'next-auth';

export const POST = async (req: NextRequest) => {
  try {
    // Request-Body parsen (hier gehen wir von JSON aus)
    const { workspace } = await req.json();

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace-ID ist erforderlich.' },
        { status: 400 }
      );
    }

    // Session abrufen, um den aktuellen User zu identifizieren
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: 'Nicht autorisiert.' },
        { status: 401 }
      );
    }

    // Verbindung zur Datenbank herstellen
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const usersCollection = db.collection('users');

    // Update: Setze das Feld currentWorkspaceId des aktuellen Users
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { currentWorkspaceId: workspace._id } }
    );

    if (result.modifiedCount > 0) {
      // Optional: Den aktualisierten User abrufen und zurückgeben
      const updatedUser = await usersCollection.findOne({
        email: session.user.email,
      });
      return NextResponse.json(updatedUser, { status: 200 });
    } else {
      return NextResponse.json(
        { message: 'Keine Änderungen vorgenommen.' },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error('Fehler beim Aktualisieren des aktuellen Workspace:', error);
    return NextResponse.json(
      { message: 'Fehler beim Aktualisieren des aktuellen Workspace.' },
      { status: 500 }
    );
  }
};
