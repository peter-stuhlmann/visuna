import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';
import { PageDB } from '@/lib/workspaces/pages/pages.types';

function escapeXml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeHost(host: string) {
  return host.split(':')[0].toLowerCase();
}

export async function GET(req: NextRequest) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const hostHeader = req.headers.get('host') || '';
  const host = normalizeHost(hostHeader);

  const workspaceIdFromQuery = req.nextUrl.searchParams.get('workspaceId');
  let workspaceId: string | null = workspaceIdFromQuery || null;

  if (!workspaceId) {
    const workspaces = db.collection<WorkspaceDB>('workspaces');
    const workspace = await workspaces.findOne({ domain: host });

    if (!workspace?._id) {
      return new NextResponse('Workspace not found for this domain', {
        status: 404,
      });
    }

    workspaceId = String(workspace._id);
  }

  const pagesCollection = db.collection<PageDB>('pages');

  // 🔥 KORREKTES 3-STATE FILTER
  const pages = await pagesCollection
    .find({
      workspaceId,
      $or: [
        { publishStatus: 'live' }, // neues System
        { publishStatus: { $exists: false } }, // legacy
      ],
    })
    .project({ slug: 1, createdAt: 1, updatedAt: 1 })
    .toArray();

  const baseUrl = req.nextUrl.origin;

  const urlEntries = pages
    .filter((p) => !!p.slug)
    .map((p) => {
      const loc = p.slug === 'home' ? `${baseUrl}/` : `${baseUrl}/${p.slug}`;
      const lastModRaw = p.updatedAt || p.createdAt;
      const lastMod = lastModRaw
        ? new Date(lastModRaw).toISOString()
        : new Date().toISOString();

      return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastMod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.slug === 'home' ? '1.0' : '0.7'}</priority>
  </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
