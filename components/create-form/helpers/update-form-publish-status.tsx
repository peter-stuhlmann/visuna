import { PageVisibility } from "@/lib/workspaces/pages/pages.types";

export default async function handleFormPublishStatus(
  slug: string,
  publishStatus: PageVisibility
) {
  const res = await fetch('/api/forms/update-publish-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      publishStatus,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Status konnte nicht gespeichert werden');
  }
}
