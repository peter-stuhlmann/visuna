import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { compare } from 'bcrypt';

import connectToDatabase from '@/utils/connectToDatabase';
import escapeRegExp from '@/utils/escapeRegExp';
import { createDbDocId } from '@/utils/createDbDocId';
import { headers } from 'next/headers';

/**
 * Extracts the client IP from request headers and performs
 * a lightweight geo lookup (country + city) via ip-api.com.
 * Falls back gracefully — never throws.
 */
async function getClientIpInfo(): Promise<{
  ip: string | null;
  country: string | null;
  city: string | null;
}> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim()
      ?? hdrs.get('x-real-ip')
      ?? null;

    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return { ip: ip ?? 'localhost', country: null, city: null };
    }

    // Free geo lookup (no API key, server-side only)
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: AbortSignal.timeout(3000),
    }).then(r => r.json()).catch(() => null);

    return {
      ip,
      country: geo?.country ?? null,
      city: geo?.city ?? null,
    };
  } catch {
    return { ip: null, country: null, city: null };
  }
}

if (!process.env.MONGO_DB_URI) throw new Error('MONGO_DB_URI is not defined');
if (!process.env.DB_NAME) throw new Error('DB_NAME is not defined');
if (!process.env.NEXTAUTH_SECRET)
  throw new Error('NEXTAUTH_SECRET is not defined');

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
      authorization: {
        params: { scope: 'openid profile email' },
      },
      issuer: 'https://www.linkedin.com/oauth',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase();

        const { db } = await connectToDatabase(process.env.DB_NAME as string);

        const user = await db.collection('users').findOne({
          email: {
            $regex: `^${escapeRegExp(normalizedEmail)}$`,
            $options: 'i',
          },
        });

        if (!user || !user.verified) {
          return null;
        }

        const isPasswordCorrect = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials-Login: kein extra Handling nötig
      if (account?.provider === 'credentials') return true;

      // OAuth-Login: User in MongoDB finden oder anlegen
      if (account?.provider && user?.email) {
        const { db } = await connectToDatabase(process.env.DB_NAME as string);
        const normalizedEmail = user.email.toLowerCase();

        const existingUser = await db.collection('users').findOne({
          email: {
            $regex: `^${escapeRegExp(normalizedEmail)}$`,
            $options: 'i',
          },
        });

        if (!existingUser) {
          // Neuen User anlegen (OAuth = sofort verifiziert, kein Passwort)
          await db.collection('users').insertOne({
            email: normalizedEmail,
            name: user.name ?? null,
            avatarUrl: user.image ?? null,
            provider: account.provider,
            verified: true,
            createdAt: new Date(),
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        (session.user as Record<string, unknown>).id = token.userId;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        const { db } = await connectToDatabase(process.env.DB_NAME as string);
        const email = user?.email?.toLowerCase();
        if (!email) return;

        const dbUser = await db.collection('users').findOne({ email });
        const userId = dbUser?._id?.toString() ?? null;
        const userName = (dbUser as any)?.name ?? user?.name ?? null;

        // IP + Geo
        const { ip, country, city } = await getClientIpInfo();
        const locationParts = [city, country].filter(Boolean);
        const locationStr = locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';

        // Find all workspaces where this user has access
        const workspaces = await db.collection('workspaces').find({
          'access.userId': userId,
        }).project({ _id: 1 }).toArray();

        for (const ws of workspaces) {
          await db.collection('activityLogs').insertOne({
            _id: createDbDocId('log') as any,
            workspaceId: ws._id,
            code: '1504',
            action: 'login',
            category: 'auth',
            entityType: 'session',
            description: `Benutzer ${email} hat sich eingeloggt${locationStr}.`,
            userId,
            userEmail: email,
            userName,
            details: { ip, country, city },
            visibility: 'superadmin',
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error('Login-Log Fehler:', err);
      }
    },
    async signOut({ token }) {
      try {
        const { db } = await connectToDatabase(process.env.DB_NAME as string);
        const userId = (token as any)?.userId?.toString() ?? null;
        if (!userId) return;

        const dbUser = await db.collection('users').findOne({ _id: userId });
        const email = dbUser?.email ?? null;
        const userName = (dbUser as any)?.name ?? null;

        // IP + Geo
        const { ip, country, city } = await getClientIpInfo();
        const locationParts = [city, country].filter(Boolean);
        const locationStr = locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';

        const workspaces = await db.collection('workspaces').find({
          'access.userId': userId,
        }).project({ _id: 1 }).toArray();

        for (const ws of workspaces) {
          await db.collection('activityLogs').insertOne({
            _id: createDbDocId('log') as any,
            workspaceId: ws._id,
            code: '1505',
            action: 'logout',
            category: 'auth',
            entityType: 'session',
            description: `Benutzer ${email ?? userId} hat sich ausgeloggt${locationStr}.`,
            userId,
            userEmail: email,
            userName,
            details: { ip, country, city },
            visibility: 'superadmin',
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error('Logout-Log Fehler:', err);
      }
    },
  },
});

export { handler as GET, handler as POST };
