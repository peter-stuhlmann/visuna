// app/api/workspace-defaults/images/get-image/route.ts
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = (searchParams.get('workspaceId') || '').trim();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Parameter "workspaceId" ist erforderlich.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const collection = db.collection<WorkspaceDefaultsDoc>('workspaceDefaults');

    const doc = await collection.findOne({ workspaceId });

    return NextResponse.json({
      workspaceId,
      fallbackImage: doc?.fallbackImage ?? null,
    });
  } catch (err) {
    console.error('workspace-defaults/images/get-image error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
