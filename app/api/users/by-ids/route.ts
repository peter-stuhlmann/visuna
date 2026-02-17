// app/api/users/by-ids/route.ts
import { NextResponse } from 'next/server';
import { getUsersByIds } from '@/lib/users/users.repo';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ users: {} });
    }

    const users = await getUsersByIds(ids);

    // Return a map of userId → { name, email }
    const userMap: Record<string, { name: string; email: string }> = {};
    for (const u of users) {
      userMap[u._id] = {
        name: u.name || u.email || 'Unbekannt',
        email: u.email || '',
      };
    }

    return NextResponse.json({ users: userMap });
  } catch (e) {
    console.error('POST /api/users/by-ids error:', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}
