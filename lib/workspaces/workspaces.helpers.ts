// lib/workspaces/workspaces.helpers.ts

import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/utils/cloudinary';
import { createDbDocId } from '@/utils/createDbDocId';

export function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
}

export async function uploadThumbnail(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = createDbDocId('thumb');

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: publicId, folder: 'visuna' }, (err, res) =>
        err ? reject(err) : resolve(res!)
      )
      .end(buffer);
  });

  return result.secure_url || '';
}
