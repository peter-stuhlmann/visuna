import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const backendRoots = ['/dashboard', '/workspaces', '/profil'];
const authRoots = [
  '/login',
  '/neues-passwort',
  '/passwort-vergessen',
  '/registrierung',
  '/registrierung-verifizieren',
];

/**
 * Entfernt Port & www.
 * z.B.:
 *  - workspace-a.localhost:3000 → workspace-a.localhost
 *  - www.kunde.de → kunde.de
 */
function normalizeHost(host: string | null) {
  if (!host) return null;
  return host.replace(/^www\./, '').split(':')[0];
}

/**
 * Workspace anhand Domain ermitteln
 * → MUSS es geben, sonst 404
 */
async function getWorkspaceByDomain(
  origin: string,
  request: NextRequest,
  domain: string
): Promise<{ id: string; mainLanguage: string } | null> {
  const url = new URL(
    `/api/workspaces/by-domain?domain=${encodeURIComponent(domain)}`,
    origin
  );

  const res = await fetch(url.toString(), {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  });

  if (!res.ok) return null;

  return (await res.json()) as {
    id: string;
    mainLanguage: string;
  };
}

function withHtmlLang(res: NextResponse, lang: string) {
  res.headers.set('x-html-lang', lang);
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // 1️⃣ Auth-Seiten: eingeloggte User zum Dashboard weiterleiten
  if (authRoots.some((prefix) => pathname.startsWith(prefix))) {
    const token = await getToken({ req: request });
    if (token) {
      return NextResponse.redirect(new URL('/workspaces', request.url));
    }
    return withHtmlLang(NextResponse.next(), 'de');
  }

  // 2️⃣ Backend → ignorieren
  if (backendRoots.some((prefix) => pathname.startsWith(prefix))) {
    return withHtmlLang(NextResponse.next(), 'de');
  }

  // 2️⃣ Host → Workspace
  const host = normalizeHost(request.headers.get('host'));
  if (!host) {
    return NextResponse.next();
  }

  const workspace = await getWorkspaceByDomain(origin, request, host);

  // ❌ Kein Workspace → echte 404
  if (!workspace) {
    return NextResponse.next();
  }

  const { id: workspaceId, mainLanguage } = workspace;

  const segments = pathname.split('/');
  // ['', locale?, ...rest]
  const locale = segments[1];
  const rest = segments.slice(2).join('/');

  // 3️⃣ Locale fehlt oder ungültig → erzwingen
  if (!routing.locales.includes(locale as any)) {
    const res = NextResponse.redirect(
      new URL(`/${mainLanguage}${rest ? `/${rest}` : ''}`, request.url)
    );

    res.headers.set('x-workspace-id', workspaceId);
    res.headers.set('x-locale', mainLanguage);

    return withHtmlLang(res, mainLanguage);
  }

  // 4️⃣ Alles korrekt → weiterreichen
  const res = NextResponse.next();

  res.headers.set('x-workspace-id', workspaceId);
  res.headers.set('x-locale', locale);

  return withHtmlLang(res, locale);
}

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|p/|.*\\..*|dashboard|workspaces).*)',
  ],
};
