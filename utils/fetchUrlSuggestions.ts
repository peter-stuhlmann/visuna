// utils/fetchUrlSuggestions.ts
'use client';

import type { UrlSuggestion } from '@/components/blocks/LinkInputBlock';

export async function fetchUrlSuggestions(
  workspaceId: string,
  query: string
): Promise<UrlSuggestion[]> {
  if (!workspaceId || !query?.trim()) return [];

  const res = await fetch(
    `/api/workspaces/${workspaceId}/pages?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) return [];

  const json = await res.json();

  return (json?.results ?? []).map((r: any) => ({
    id: r.id,
    label: r.label,
    href: r.href,
    subtitle: r.subtitle,
  }));
}
