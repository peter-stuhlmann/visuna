// app/sitemap.xml/route.ts
import { routes } from '@/i18n/routes'; // Passe den Pfad an

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';

  // Erzeuge ein Array aller Routen inklusive Locale-Prefix.
  // Dabei iterieren wir über alle Einträge und nutzen Object.entries,
  // um sowohl den Sprachcode als auch den Routen-Wert zu erhalten.
  const allRoutes = Object.values(routes).flatMap((routeObj) =>
    Object.entries(routeObj).map(([lang, route]) => ({
      // Falls der Routen-Wert bereits mit einem Slash beginnt, passt es:
      // so erhalten wir z. B. "https://example.com/en/content-elements"
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date().toISOString(),
    }))
  );

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}
