import { NextRequest, NextResponse } from 'next/server';
import { ObjectId, ClientSession, UpdateResult } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';

type PageDoc = {
  _id: ObjectId;
  pageElements: ObjectId[]; // 👈 wichtig: als Array typisieren
  // ...optional weitere Felder
};

type PageElementDoc = {
  _id: ObjectId;
  // ...optional weitere Felder
};

export const POST = async (req: NextRequest) => {
  try {
    const { pageElementId, pageId } = await req.json();

    if (
      !pageElementId ||
      typeof pageElementId !== 'string' ||
      !/^[a-f\d]{24}$/i.test(pageElementId)
    ) {
      return NextResponse.json(
        { message: 'Ungültige pageElementId übergeben.' },
        { status: 400 }
      );
    }

    const _id = new ObjectId(pageElementId);
    const { db, client } = await connectToDatabase(process.env.DB_NAME!);

    const pagesCol = db.collection<PageDoc>('pages');
    const peCol = db.collection<PageElementDoc>('pageElements');

    // Hilfsfunktion: Pull + Delete (ggf. in Session)
    const run = async (session?: ClientSession) => {
      const pageFilter =
        pageId && /^[a-f\d]{24}$/i.test(pageId)
          ? { _id: new ObjectId(pageId), pageElements: _id }
          : { pageElements: _id };

      // ✅ TS kennt jetzt: pageElements ist ObjectId[]
      const pagesRes: UpdateResult<PageDoc> = await pagesCol.updateMany(
        pageFilter,
        { $pull: { pageElements: _id } },
        session ? { session } : undefined
      );

      const delRes = await peCol.deleteOne(
        { _id },
        session ? { session } : undefined
      );
      if (delRes.deletedCount === 0) {
        throw new Error('Kein passendes Seitenelement gefunden.');
      }

      return { pagesRes, delRes };
    };

    // Transaktion versuchen, sonst Fallback ohne
    try {
      const session = client.startSession();
      let result: Awaited<ReturnType<typeof run>> | undefined;

      await session.withTransaction(async () => {
        result = await run(session);
      });

      session.endSession();
      const { pagesRes, delRes } = result!;
      return NextResponse.json(
        {
          message: 'Seitenelement erfolgreich gelöscht und aus Pages entfernt.',
          deleted: delRes.deletedCount,
          pagesMatched: pagesRes.matchedCount,
          pagesModified: pagesRes.modifiedCount,
        },
        { status: 200 }
      );
    } catch {
      const { pagesRes, delRes } = await run();
      return NextResponse.json(
        {
          message:
            'Seitenelement gelöscht und aus Pages entfernt (ohne Transaktion).',
          deleted: delRes.deletedCount,
          pagesMatched: pagesRes.matchedCount,
          pagesModified: pagesRes.modifiedCount,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[DELETE PAGE ELEMENT]', error);
    const msg =
      error instanceof Error
        ? error.message
        : 'Interner Serverfehler beim Löschen.';
    const status = msg === 'Kein passendes Seitenelement gefunden.' ? 404 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
};
