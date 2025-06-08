import { getWorkspace } from './getWorkspace';
import { notFound, redirect } from 'next/navigation';
import EditWorkspace from '@/components/forms/edit-workspace';
import isUserLoggedIn from '@/utils/isUserLoggedIn';
import { Heading, Wrapper } from '@/components/content-elements/default';

type WorkspacePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
};

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;

  if (!id) {
    notFound();
  }

  const workspace = await getWorkspace(id as string);

  if (!workspace) {
    notFound();
  }

  return (
    <Wrapper>
      <Heading value={`Workspace ${workspace.name}`} />
      {resolvedSearchParams.action === 'edit' && (
        <EditWorkspace workspace={workspace} />
      )}
    </Wrapper>
  );
}
