// app/api/workspaces/[workspaceId]/ai-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAiLogs, getAiLogStats } from '@/lib/workspaces/ai-logs/aiLogs.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '200', 10);

    const [logs, stats] = await Promise.all([
      getAiLogs(workspaceId, limit),
      getAiLogStats(workspaceId),
    ]);

    return NextResponse.json({ logs, stats });
  } catch (err) {
    console.error('Fehler in GET /api/workspaces/[id]/ai-logs:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
