// app/api/workspace-defaults/images/save/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/connectToDatabase';

type LocalizedText = Record<string, string>;

export type WorkspaceFallbackImage = {
  src?: string;
  alt?: LocalizedText;
  width?: number;
  height?: number;
  caption?: LocalizedText;
  copyright?: LocalizedText;
  className?: string;
};

type WorkspaceDefaultsDoc = {
  workspaceId: string;
  fallbackImage?: WorkspaceFallbackImage | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type SaveWorkspaceDefaultsBody = {
  workspaceId?: string;
  fallbackImage?: WorkspaceFallbackImage | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveWorkspaceDefaultsBody;

    const workspaceId = (body.workspaceId || '').trim();
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Feld "workspaceId" ist erforderlich.' },
        { status: 400 }
      );
    }

    const rawFallback = body.fallbackImage;

    const fallbackImage: WorkspaceFallbackImage | null =
      rawFallback && typeof rawFallback === 'object'
        ? (rawFallback as WorkspaceFallbackImage)
        : null;

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const collection = db.collection<WorkspaceDefaultsDoc>('workspaceDefaults');

    const now = new Date();

    await collection.updateOne(
      { workspaceId },
      {
        $set: {
          workspaceId,
          fallbackImage,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      workspaceId,
      fallbackImage,
    });
  } catch (err) {
    console.error('workspace-defaults/images/save error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
