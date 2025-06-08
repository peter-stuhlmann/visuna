import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';

// Note: `params` is a Promise<{ id: string }>
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Await params here

  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const workspace = await db
    .collection('workspaces')
    .findOne({ _id: new ObjectId(id) });

  if (!workspace) {
    return NextResponse.json(
      { message: 'Workspace not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    _id: workspace._id.toString(),
    name: workspace.name,
    thumbnail: workspace.thumbnail,
    access: workspace.access,
  });
}
