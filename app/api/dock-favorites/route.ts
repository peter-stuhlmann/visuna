import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { dockFavorites: 1 } }
    );

    return NextResponse.json({ favorites: user?.dockFavorites ?? [] });
  } catch (error) {
    console.error('GET /api/dock-favorites error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                     PUT                                    */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { favorites } = await req.json();

    if (!Array.isArray(favorites) || favorites.length > 5) {
      return NextResponse.json(
        { message: 'Favorites must be an array with max 5 items' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { dockFavorites: favorites } }
    );

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('PUT /api/dock-favorites error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
