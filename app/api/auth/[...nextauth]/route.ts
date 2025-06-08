import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

import connectToDatabase from '@/utils/connectToDatabase';
import escapeRegExp from '@/utils/escapeRegExp';

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
});

export { handler as GET, handler as POST };
