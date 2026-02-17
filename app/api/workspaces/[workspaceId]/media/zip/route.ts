
import { NextRequest, NextResponse } from 'next/server';
import { getMediaByIds } from '@/lib/workspaces/media/media.repo';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import AdmZip from 'adm-zip';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    // 1. Access Check
    const access = await checkWorkspaceAccess(workspaceId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body
    const { publicIds } = (await req.json()) as { publicIds: string[] };
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // 3. Fetch Media Docs
    const docs = await getMediaByIds(workspaceId, publicIds);
    if (docs.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }

    // 4. Download Files & Add to Zip
    const zip = new AdmZip();
    const downloadPromises = docs.map(async (doc) => {
      const url = doc.secureUrl || doc.url;
      if (!url) return;

      try {
        const response = await fetch(url);
        if (!response.ok) return;
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        let filename = doc.publicId.split('/').pop() || doc.publicId;
        // ensure extension
        if (doc.format && !filename.endsWith(`.${doc.format}`)) {
           filename += `.${doc.format}`;
        }
        
        zip.addFile(filename, buffer);
      } catch (err) {
        console.error(`Failed to download ${url}`, err);
      }
    });

    await Promise.all(downloadPromises);

    // 5. Generate Buffer
    const zipBuffer = zip.toBuffer();

    // 6. Return Response
    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="media_pool_download.zip"',
      },
    });
  } catch (error) {
    console.error('ZIP Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
