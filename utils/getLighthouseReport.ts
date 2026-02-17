// utils/getLighthouseReport.ts
import { unstable_noStore as noStore } from 'next/cache';
import connectToDatabase from '@/utils/connectToDatabase';
import type {
  LighthouseReport,
  LighthouseReportDoc,
} from '@/lib/workspaces/pages/analysis/analysis.types';

export async function getLighthouseReport(
  pageId: string
): Promise<LighthouseReport | null> {
  // ✅ wichtig: verhindert Next.js Server-Cache (sonst sieht man neue Reports erst nach Hard-Refresh)
  noStore();

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<LighthouseReportDoc>('lighthouseReports');

  const doc = await collection.findOne({ pageId });
  if (!doc) return null;

  // DB -> API (Dates als ISO-Strings)
  const report: LighthouseReport = {
    pageId: doc.pageId,
    url: doc.url,
    summary: doc.summary,
    mobile: doc.mobile,
    desktop: doc.desktop,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt),
  };

  return report;
}
