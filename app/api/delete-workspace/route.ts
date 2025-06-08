import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';
import cloudinary from '@/utils/cloudinary';
import extractPublicImageId from '@/utils/extractPublicImageId';

export const POST = async (req: NextRequest) => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const workspaceCollection = db.collection('workspaces');
  const usersCollection = db.collection('users');

  try {
    const { id } = await req.json();

    // Sicherstellen, dass eine ID vorhanden ist
    if (!id) {
      return NextResponse.json(
        { message: 'Workspace-ID ist erforderlich.' },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(id as string);

    // Workspace abrufen, um alle Informationen (Thumbnail, access etc.) zu erhalten
    const workspace = await workspaceCollection.findOne({ _id: objectId });
    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace nicht gefunden.' },
        { status: 404 }
      );
    }

    // Falls ein Thumbnail vorhanden ist, entferne es aus Cloudinary
    if (workspace.thumbnail) {
      const publicId = extractPublicImageId(workspace.thumbnail);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log('Cloudinary Bild gelöscht:', publicId);
        } catch (cloudErr) {
          console.error('Fehler beim Löschen des Cloudinary Bildes:', cloudErr);
          // Hier kannst du entscheiden, ob du den Löschvorgang abbrechen oder fortsetzen möchtest
        }
      }
    }

    // Falls der Workspace anderen Nutzern zugewiesen ist, also ein "access"-Array besitzt,
    // entferne den Workspace-Eintrag in jedem zugehörigen User-Dokument.
    if (
      workspace.access &&
      Array.isArray(workspace.access) &&
      workspace.access.length > 0
    ) {
      // Extrahiere die User-IDs aus dem access-Array
      const accessUserIds = workspace.access.map(
        (item: { id: string; role: string }) => item.id
      );

      // Nur gültige ObjectId-Strings berücksichtigen
      const validUserObjectIds = accessUserIds
        .filter((uid) => ObjectId.isValid(uid))
        .map((uid) => new ObjectId(uid));

      await usersCollection.updateMany(
        { _id: { $in: validUserObjectIds } },
        { $pull: { workspaces: id } }
      );
    }

    // Lösche den Workspace anhand der ID
    const result = await workspaceCollection.deleteOne({ _id: objectId });

    if (result.deletedCount > 0) {
      return NextResponse.json(
        { message: 'Workspace erfolgreich gelöscht.' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Workspace nicht gefunden.' },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error('Fehler beim Löschen des Workspace:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Workspace.' },
      { status: 500 }
    );
  }
};
