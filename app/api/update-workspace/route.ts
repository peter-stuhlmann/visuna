import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import cloudinary from '@/utils/cloudinary';
import extractPublicImageId from '@/utils/extractPublicImageId';

export const POST = async (req: NextRequest) => {
  try {
    // FormData parsen
    const formData = await req.formData();

    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString();
    const file = formData.get('thumbnail') as File | null;

    if (!id || !name) {
      return NextResponse.json(
        { message: 'Workspace-ID und Name sind erforderlich.' },
        { status: 400 }
      );
    }

    let thumbnailUrl: string | null = null;

    // Falls eine neue Datei hochgeladen wurde, in Cloudinary hochladen
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result as { secure_url: string });
            }
          );
          uploadStream.end(buffer);
        }
      );
      thumbnailUrl = uploadResult.secure_url;
    }

    // Verbindung zur Datenbank herstellen
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const workspaceCollection = db.collection('workspaces');

    // Falls ein neues Thumbnail hochgeladen wurde, das alte löschen
    if (thumbnailUrl) {
      const currentWorkspace = await workspaceCollection.findOne({
        _id: new ObjectId(id),
      });
      if (currentWorkspace && currentWorkspace.thumbnail) {
        const publicId = extractPublicImageId(currentWorkspace.thumbnail);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log('Altes Thumbnail gelöscht:', publicId);
          } catch (cloudErr) {
            console.error(
              'Fehler beim Löschen des alten Thumbnails:',
              cloudErr
            );
          }
        }
      }
    }

    // Felder für das Update zusammenstellen
    const updateFields: Record<string, string> = { name };
    if (thumbnailUrl) {
      updateFields.thumbnail = thumbnailUrl;
    }

    // Workspace-Dokument anhand der ID updaten
    const result = await workspaceCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount > 0) {
      // Aktualisierten Workspace auslesen und zurückgeben
      const updatedWorkspace = await workspaceCollection.findOne({
        _id: new ObjectId(id),
      });
      return NextResponse.json(updatedWorkspace, { status: 200 });
    } else {
      return NextResponse.json(
        { message: 'Keine Änderungen vorgenommen.' },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error('Fehler beim Aktualisieren des Workspace:', error);
    return NextResponse.json(
      { message: 'Fehler beim Aktualisieren des Workspace.' },
      { status: 500 }
    );
  }
};
