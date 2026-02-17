import { NextRequest, NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';
import { getServerSession } from 'next-auth';

import cloudinary from '@/utils/cloudinary';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import {
  createWorkspaceWithUsers,
  getWorkspacesForUser,
  updateWorkspaceService,
} from '@/lib/workspaces/workspaces.service';
import { createDbDocId } from '@/utils/createDbDocId';

function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
}

/* ---------- GET LIST BY USER ---------- */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await getWorkspacesForUser(loggedInUser._id);

    return NextResponse.json(workspaces, { status: 200 });
  } catch (e) {
    console.error('GET /api/workspaces error:', e);
    return NextResponse.json({ message: 'Serverfehler' }, { status: 500 });
  }
}

/* ---------- CREATE ---------- */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = String(formData.get('name') || '').trim();
    const domainRaw = String(formData.get('domain') || '').trim();
    const users = JSON.parse(String(formData.get('users') || '[]'));
    const file = formData.get('thumbnail');

    if (!name || !domainRaw) {
      return NextResponse.json(
        { message: 'Name und Domain sind erforderlich.' },
        { status: 400 }
      );
    }

    const domain = normalizeDomain(domainRaw);

    let thumbnailUrl = '';
    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const publicId = createDbDocId('img');

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { public_id: publicId, folder: 'visuna' },
            (err, res) => (err ? reject(err) : resolve(res!))
          )
          .end(buffer);
      });

      thumbnailUrl = result.secure_url || '';
    }

    const workspace = await createWorkspaceWithUsers({
      name,
      domain,
      thumbnail: thumbnailUrl,
      ownerUserId: loggedInUser._id,
      users, // nur E-Mails
    });

    return NextResponse.json(
      { ...workspace, message: 'Workspace created.' },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.message === 'DOMAIN_EXISTS') {
      return NextResponse.json(
        { message: 'Domain bereits vergeben.' },
        { status: 400 }
      );
    }

    if (e.message.includes('INVALID_USERS')) {
      return NextResponse.json(
        { message: e.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Serverfehler' }, { status: 500 });
  }
}

/* ---------- UPDATE ---------- */
/* ---------- UPDATE ---------- */
export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();

    const workspaceId = String(formData.get('workspaceId') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const domainRaw = String(formData.get('domain') || '').trim();
    const file = formData.get('thumbnail') as File | null;

    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Workspace-ID fehlt.' },
        { status: 400 }
      );
    }

    if (!name || !domainRaw) {
      return NextResponse.json(
        { message: 'Name und Domain sind erforderlich.' },
        { status: 400 }
      );
    }

    const domain = normalizeDomain(domainRaw);

    let thumbnailUrl: string | null = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream((err, res) => (err ? reject(err) : resolve(res!)))
          .end(buffer);
      });

      thumbnailUrl = result.secure_url;
    }

    const updated = await updateWorkspaceService({
      workspaceId,
      name,
      domain,
      thumbnail: thumbnailUrl,
    });

    return NextResponse.json(
      { workspace: updated, message: 'Workspace aktualisiert.' },
      { status: 200 }
    );
  } catch (e: any) {
    if (e.message === 'DOMAIN_EXISTS') {
      return NextResponse.json(
        { message: 'Domain bereits vergeben.' },
        { status: 400 }
      );
    }

    if (e.message === 'WORKSPACE_NOT_FOUND') {
      return NextResponse.json(
        { message: 'Workspace nicht gefunden.' },
        { status: 404 }
      );
    }

    console.error('PATCH /api/workspaces error:', e);
    return NextResponse.json({ message: 'Serverfehler' }, { status: 500 });
  }
}

