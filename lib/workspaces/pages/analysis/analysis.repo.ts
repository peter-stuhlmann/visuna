import connectToDatabase from '@/utils/connectToDatabase';
import { LighthouseReportDoc } from './analysis.types';

export async function upsertLighthouseReport(data: LighthouseReportDoc) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const { pageId, url, summary, mobile, desktop, createdAt } = data;

  await db.collection<LighthouseReportDoc>('lighthouseReports').updateOne(
    { pageId },
    {
      $set: {
        url,
        summary,
        mobile,
        desktop,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt,
      },
    },
    { upsert: true }
  );
}
