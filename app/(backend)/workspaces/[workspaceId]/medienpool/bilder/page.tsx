import MediaPool from '@/components/MediaUpload';

import { getWorkspaceById } from '@/lib/workspaces/workspaces.repo';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { listWorkspaceMedia } from '@/lib/workspaces/media/media.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medienpool – Bilder',
  description:
    'Verwalte die Bilder Deines Workspaces: Dateien hochladen, Metadaten bearbeiten, Bilder suchen und in Seiten einbinden.',
};

export default async function MediapoolPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const [workspace, user, resources] = await Promise.all([
    getWorkspaceById(workspaceId),
    getLoggedInUser(),
    listWorkspaceMedia(workspaceId),
  ]);

  // default 'de' if nothing configured
  const languages = workspace?.languages?.contentLanguages || ['de'];
  const savedViewMode = user?.preferences?.mediaPoolViewMode ?? 'grid';

  return (
    <MediaPool 
      workspaceId={workspaceId} 
      availableLanguages={languages}
      initialViewMode={savedViewMode}
      initialFiles={resources as any}
    />
  );
}
