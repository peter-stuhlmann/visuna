import { NextResponse } from 'next/server';
import { listWorkspaceMedia, uploadMedia } from '@/lib/workspaces/media/media.service';
import { getLoggedInUser } from '@/utils/getLoggedInUser';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const resources = await listWorkspaceMedia(workspaceId);
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('GET /api/workspaces/:id/media error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
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

    // Get Logged In User
    const user = await getLoggedInUser();

    if (!user || !user._id) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await uploadMedia(workspaceId, buffer, user._id);

    // Return format compatible with frontend expectations (MediaUploadResource)
    return NextResponse.json({
      public_id: doc.publicId,
      secure_url: doc.secureUrl,
      url: doc.url,
      width: doc.width,
      height: doc.height,
      format: doc.format,
      meta: doc.meta,
    });
  } catch (error) {
    console.error('POST /api/workspaces/:id/media error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
