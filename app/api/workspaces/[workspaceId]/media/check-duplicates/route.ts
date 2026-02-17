import { NextResponse } from 'next/server';
import { getMediaByWorkspace } from '@/lib/workspaces/media/media.repo';
import { computePhash, hammingDistance } from '@/lib/workspaces/media/phash';

const SIMILARITY_THRESHOLD = 10; // Hamming distance ≤ 10 = likely duplicate

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compute pHash of the uploaded file
    let uploadHash: string;
    try {
      uploadHash = await computePhash(buffer);
    } catch (err) {
      console.error('Failed to compute pHash for uploaded file:', err);
      // If we can't hash it, just say no duplicates
      return NextResponse.json({ similar: [] });
    }

    // Get all media for this workspace
    const docs = await getMediaByWorkspace(workspaceId, 500, 0);

    // Compare hashes
    const similar: Array<{
      publicId: string;
      secureUrl: string;
      width: number | null;
      height: number | null;
      distance: number;
    }> = [];

    for (const doc of docs) {
      if (!doc.phash) continue;

      const dist = hammingDistance(uploadHash, doc.phash);
      if (dist <= SIMILARITY_THRESHOLD) {
        similar.push({
          publicId: doc.publicId,
          secureUrl: doc.secureUrl,
          width: doc.width,
          height: doc.height,
          distance: dist,
        });
      }
    }

    // Sort by distance (most similar first)
    similar.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ similar });
  } catch (error) {
    console.error('POST /api/workspaces/:id/media/check-duplicates error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
