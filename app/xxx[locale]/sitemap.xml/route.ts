import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

type WorkspaceDoc = {
  _id: unknown;
  domain?: string; // ✅ nur eine Domain pro Workspace
};

type PageDoc = {
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
  workspaceId: string;
};

function escapeXml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeHost(host: string) {
  // Host kommt evtl. mit Port (localhost:3000)
  return host.split(':')[0].toLowerCase();
}

export async function GET(req: NextRequest) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const hostHeader = req.headers.get('host') || '';
  const host = normalizeHost(hostHeader);

  // Optional: Dev-Fallback über Query param (nur wenn du willst)
  // Beispiel: http://localhost:3000/sitemap.xml?workspaceId=...
  const workspaceIdFromQuery = req.nextUrl.searchParams.get('workspaceId');
  let workspaceId: string | null = workspaceIdFromQuery || null;

  if (!workspaceId) {
    // ✅ Workspace anhand der (einzigen) Domain finden
    const workspaces = db.collection<WorkspaceDoc>('workspaces');

    const workspace = await workspaces.findOne({ domain: host });

    if (!workspace?._id) {
      return new NextResponse('Workspace not found for this domain', {
        status: 404,
      });
    }

    workspaceId = String(workspace._id);
  }

  // Nur Seiten dieses Workspaces
  const pagesCollection = db.collection<PageDoc>('pages');
  const pages = await pagesCollection
    .find({ workspaceId, published: true })
    .project({ slug: 1, createdAt: 1, updatedAt: 1 })
    .toArray();

  const baseUrl = req.nextUrl.origin; // garantiert passend zur Domain

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
      // Caching optional – je nach Update-Frequenz:
      // 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
