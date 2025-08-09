import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Separate Listen
const backendRoots = ['/dashboard', '/workspaces'];
const authRoots = [
  '/login',
  '/neues-passwort',
  '/passwort-vergessen',
  '/registrierung',
  '/registrierung-verifizieren',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prüfung: eines der beiden Arrays matcht den Pfad
  if (
    [...backendRoots, ...authRoots].some((prefix) =>
      pathname.startsWith(prefix)
    )
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*|dashboard|workspaces|login|neues-passwort|passwort-vergessen|registrierung|registrierung-verifizieren).*)',
  ],
};
