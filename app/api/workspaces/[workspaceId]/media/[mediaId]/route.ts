import { NextResponse } from 'next/server';
import { deleteWorkspaceMedia, updateMediaMetadata } from '@/lib/workspaces/media/media.service';
import { getLoggedInUser } from '@/utils/getLoggedInUser';

/* -------------------------------------------------------------------------- */
/*                                    PATCH                                   */
/* -------------------------------------------------------------------------- */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; mediaId: string }> }
) {
  try {
    // mediaId is effectively publicId (but encoded?)
    // Actually publicId contains slashes "mediapool/folder/id". 
    // Next.js dynamic routes with slashes need catch-all or encoded params.
    // simpler: frontend sends publicId in body? 
    // OR: we use a simpler ID for routing?
    // PublicId is unique key. Usually passed as query param or body if it contains slashes.
    // To stick to REST: /media/[...mediaId] or just pass in body?
    // The user asked for clean routes.
    // If we use mediaId in path, typically we need to URL encode it.
    // Let's assume publicId is passed in body for PATCH to be safe regarding slashes, 
    // OR we assume standard IDs. Cloudinary IDs have slashes if folders are used.
    
    // User Request: "rename Fetch-Urls so GET; POST; PATCH and DELETE are in one file"
    // Usually implies /api/resource/[id].
    // If [id] has slashes, Next.js needs [...id].
    // But let's look at how frontend uses it. Frontend likely wants to update by publicId.
    
    // Let's check params using catch-all if needed.
    // BUT: If I define this file as [mediaId]/route.ts, it handles that segment.
    // If publicId is "mediapool/myws/abc", url is ".../media/mediapool%2Fmyws%2Fabc".
    // Decoded param "mediaId" should be correct.
    
    const { workspaceId, mediaId } = await params;
    
    // Decode if needed, though Next usually decodes params.
    const publicId = decodeURIComponent(mediaId);

    const data = await req.json();

    const user = await getLoggedInUser();
    if (!user || !user._id) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handling metadata update
    if (data.meta) {
        const updated = await updateMediaMetadata(workspaceId, publicId, user._id, data.meta);
         return NextResponse.json(updated);
    }
    
    return NextResponse.json({ message: 'No valid update data' }, { status: 400 });

  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
         return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    console.error('PATCH media error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; mediaId: string }> }
) {
  try {
    const { workspaceId, mediaId } = await params;
    const publicId = decodeURIComponent(mediaId);

    await deleteWorkspaceMedia(workspaceId, publicId);

    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
   }
    console.error('DELETE media error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
