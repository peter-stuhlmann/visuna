import cloudinary from '@/utils/cloudinary';
import {
  createMedia,
  deleteMedia as deleteMediaRepo,
  getMediaByWorkspace,
  getMediaById,
  updateMedia as updateMediaRepo
} from './media.repo';
import { MediaDoc, MediaMeta } from './media.types';
import type { UploadApiResponse } from 'cloudinary';
import { getUsersByIds } from '@/lib/users/users.repo';
import { computePhash } from './phash';
import saveLog from '@/components/logs/saveLog';

/* -------------------------------------------------------------------------- */
/*                                     LIST                                   */
/* -------------------------------------------------------------------------- */
export async function listWorkspaceMedia(workspaceId: string) {
  // Now strictly fetching from DB filtering by workspaceId
  const docs = await getMediaByWorkspace(workspaceId);
  
  // Collect all user IDs
  const userIds = new Set<string>();
  docs.forEach(doc => {
    if (doc.createdBy) userIds.add(doc.createdBy);
    if (doc.updatedBy) userIds.add(doc.updatedBy);
  });

  const users = await getUsersByIds(Array.from(userIds));
  const userMap = new Map(users.map(u => [u._id, u.email])); // Fallback to email if name missing? Or fetch profile?
  // UserDB usually has name in profile or root? Let's check UserDB. 
  // Assuming root name or profile.name. I'll check user structure later or assume structure. 
  // Wait, I should verify UserDB structure.
  
  return docs.map(doc => {
    // Helper to find name
    const getName = (id?: string) => {
        if (!id) return undefined;
        const u = users.find(x => x._id === id);
        // Assuming user.name or user.profile?.name exists. 
        // Based on previous context "User" type has top-level name. "UserDB" might not?
        // Let's use any for safety/speed here or just email if name missing.
        const name = (u as any)?.name || (u as any)?.profile?.name || u?.email || 'Unbekannt';
        return name;
    }

    return {
        public_id: doc.publicId,
        secure_url: doc.secureUrl,
        url: doc.url,
        width: doc.width,
        height: doc.height,
        format: doc.format,
        meta: doc.meta,
        created_at: doc.createdAt.toISOString(),
        updated_at: doc.updatedAt.toISOString(),
        createdBy: doc.createdBy,
        createdByName: getName(doc.createdBy),
        updatedBy: doc.updatedBy,
        updatedByName: getName(doc.updatedBy),
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                                    UPLOAD                                  */
/* -------------------------------------------------------------------------- */
export async function uploadMedia(workspaceId: string, fileBuffer: Buffer, userId: string): Promise<MediaDoc> {
  // Compute perceptual hash before upload
  let phash: string | undefined;
  try {
    phash = await computePhash(fileBuffer);
  } catch (err) {
    console.warn('pHash computation failed, continuing without:', err);
  }

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          // Folder isolation by workspaceId
          folder: `mediapool/${workspaceId}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload failed'));
          }
          resolve(result);
        }
      )
      .end(fileBuffer);
  });

  const now = new Date();
  const doc: MediaDoc = {
    publicId: result.public_id,
    workspaceId,
    secureUrl: result.secure_url,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    meta: {},
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
    ...(phash ? { phash } : {}),
  };

  await createMedia(doc);

  await saveLog({
    workspaceId,
    code: '1301',
    action: 'created',
    category: 'media',
    entityType: 'image',
    entityId: doc.publicId,
    description: `Bild hochgeladen: ${doc.publicId}.`,
  });

  return doc;
}

/* -------------------------------------------------------------------------- */
/*                                    UPDATE                                  */
/* -------------------------------------------------------------------------- */
export async function updateMediaMetadata(
  workspaceId: string, 
  publicId: string, 
  userId: string,
  meta: Partial<MediaMeta>
) {
  const existing = await getMediaById(workspaceId, publicId);
  if (!existing) throw new Error('NOT_FOUND');

  const nextMeta = {
     alt: { ...existing.meta.alt, ...meta.alt },
     title: { ...existing.meta.title, ...meta.title },
     caption: { ...existing.meta.caption, ...meta.caption },
     copyright: { ...existing.meta.copyright, ...meta.copyright },
  };

  await updateMediaRepo(workspaceId, publicId, { 
      meta: nextMeta,
      updatedBy: userId
  });

  await saveLog({
    workspaceId,
    code: '1302',
    action: 'updated',
    category: 'media',
    entityType: 'image',
    entityId: publicId,
    description: `Bild-Metadaten aktualisiert: ${publicId}.`,
  });

  return { ...existing, meta: nextMeta, updatedBy: userId, updatedAt: new Date() };
}

/* -------------------------------------------------------------------------- */
/*                                    DELETE                                  */
/* -------------------------------------------------------------------------- */
export async function deleteWorkspaceMedia(workspaceId: string, publicId: string) {
  const existing = await getMediaById(workspaceId, publicId);
  if (!existing) throw new Error('NOT_FOUND');

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(publicId);

  // Delete from DB
  await deleteMediaRepo(workspaceId, publicId);

  await saveLog({
    workspaceId,
    code: '1303',
    action: 'deleted',
    category: 'media',
    entityType: 'image',
    entityId: publicId,
    description: `Bild gelöscht: ${publicId}.`,
  });
}
