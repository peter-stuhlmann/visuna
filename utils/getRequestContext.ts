// utils/getRequestContext.ts
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export type RequestContext = {
  workspaceId: string | null;
  locale: string | null;
};

export async function getRequestContext(opts?: {
  requireWorkspace?: boolean;
}): Promise<RequestContext> {
  const h = await headers();

  const workspaceId = h.get('x-workspace-id');
  const locale = h.get('x-locale');

  if (opts?.requireWorkspace && !workspaceId) {
    notFound(); // 👈 sauberes Next.js-Verhalten
  }

  return {
    workspaceId,
    locale,
  };
}
