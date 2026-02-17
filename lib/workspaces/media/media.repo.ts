import connectToDatabase from '@/utils/connectToDatabase';
import { MediaDoc } from './media.types';

export const getMediaCollection = async () => {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  return db.collection<MediaDoc>('media');
};

export async function getMediaByWorkspace(
  workspaceId: string,
  limit = 50,
  offset = 0
): Promise<MediaDoc[]> {
  const collection = await getMediaCollection();
  return collection
    .find({ workspaceId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
}

export async function getMediaById(workspaceId: string, publicId: string): Promise<MediaDoc | null> {
  const collection = await getMediaCollection();
  return collection.findOne({ workspaceId, publicId });
}

export async function getMediaByIds(workspaceId: string, publicIds: string[]): Promise<MediaDoc[]> {
  const collection = await getMediaCollection();
  return collection.find({ workspaceId, publicId: { $in: publicIds } }).toArray();
}

export async function createMedia(media: MediaDoc): Promise<void> {
  const collection = await getMediaCollection();
  await collection.insertOne(media);
}

export async function updateMedia(
  workspaceId: string,
  publicId: string,
  updates: Partial<MediaDoc>
): Promise<void> {
  const collection = await getMediaCollection();
  await collection.updateOne(
    { workspaceId, publicId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function deleteMedia(workspaceId: string, publicId: string): Promise<void> {
  const collection = await getMediaCollection();
  await collection.deleteOne({ workspaceId, publicId });
}
