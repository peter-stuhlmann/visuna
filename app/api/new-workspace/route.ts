import { NextRequest, NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import cloudinary from '@/utils/cloudinary';
import { getLoggedInUser } from '@/utils/getLoggedInUser';

// Interface für das User-Dokument: Workspaces werden als Objekte mit _id als string gespeichert
interface UserDoc {
  _id: ObjectId;
  email: string;
  workspaces: string[];
  currentWorkspaceId?: string;
  // weitere Felder falls benötigt
}

export const POST = async (req: NextRequest) => {
  try {
    // Authentifizierung: Session abrufen
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const loggedInUser = await getLoggedInUser();

    // multipart/form-data parsen
    const formData = await req.formData();
    const name = formData.get('name');
    const file = formData.get('thumbnail');

    // Validierung von name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: 'Workspace name is required.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);

    // Den aktuell angemeldeten User in der Collection "users" suchen
    const usersCollection = db.collection<UserDoc>('users');
    const userDoc = await usersCollection.findOne({
      email: session.user.email,
    });
    if (!userDoc) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    // Überprüfen, ob der gefundene User mit dem loggedInUser übereinstimmt
    if (
      loggedInUser &&
      userDoc._id.toString() !== loggedInUser._id.toString()
    ) {
      return NextResponse.json(
        { message: 'Unauthorized user.' },
        { status: 401 }
      );
    }

    // Falls ein Bild hochgeladen wurde, dieses verarbeiten und zu Cloudinary senden
    let thumbnailUrl = '';
    if (file && file instanceof File) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uniquePublicId = randomUUID();

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { public_id: uniquePublicId, folder: 'visuna' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          )
          .end(fileBuffer);
      });

      thumbnailUrl = result.secure_url || '';
    }

    // Neues Workspace-Dokument erstellen.
    // Dabei wird im Feld "access" der User als Admin eingetragen – die User-ID wird als String übergeben.
    const workspaceDoc = {
      name,
      thumbnail: thumbnailUrl,
      access: [{ userId: String(userDoc._id), role: 'Admin' }],
      createdAt: new Date(),
    };

    // Workspace in der Collection "workspaces" speichern
    const insertResult = await db
      .collection('workspaces')
      .insertOne(workspaceDoc);

    if (!insertResult.acknowledged) {
      return NextResponse.json(
        { message: 'Failed to create workspace in DB.' },
        { status: 500 }
      );
    }
    // Neu erstellte Workspace-ID ermitteln
    const newWorkspaceId = insertResult.insertedId;

    // Im User-Dokument:
    // - Die neue Workspace-ID (als String) zum Array "workspaces" hinzufügen
    // - Das Feld "currentWorkspaceId" auf die neue Workspace-ID setzen
    await usersCollection.updateOne(
      { _id: userDoc._id },
      {
        $push: {
          workspaces: newWorkspaceId.toString(),
        },
        $set: {
          currentWorkspaceId: newWorkspaceId.toString(),
        },
      }
    );

    return NextResponse.json(
      {
        _id: newWorkspaceId.toString(),
        message: 'Workspace created successfully.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
};
