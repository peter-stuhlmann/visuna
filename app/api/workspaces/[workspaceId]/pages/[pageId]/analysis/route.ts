import { NextResponse } from 'next/server';
import {
  runLighthouseForStrategy,
  runFullLighthouse,
} from '@/lib/workspaces/pages/analysis/analysis.service';
import { upsertLighthouseReport } from '@/lib/workspaces/pages/analysis/analysis.repo';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const url = (searchParams.get('url') || '').trim();
    const strategy =
      searchParams.get('strategy') === 'desktop' ? 'desktop' : 'mobile';

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const { raw, summary } = await runLighthouseForStrategy(url, strategy);

    return NextResponse.json({ raw, summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ workspaceId: string; pageId: string }> }
) {
  try {
    const { pageId } = await context.params;
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const result = await runFullLighthouse(url);
    const now = new Date();

    await upsertLighthouseReport({
      pageId,
      url,
      summary: {
        mobile: result.mobile,
        desktop: result.desktop,
      },
      mobile: result.mobileRaw,
      desktop: result.desktopRaw,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      pageId,
      url,
      summary: {
        mobile: result.mobile,
        desktop: result.desktop,
      },
      mobile: result.mobileRaw,
      desktop: result.desktopRaw,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
