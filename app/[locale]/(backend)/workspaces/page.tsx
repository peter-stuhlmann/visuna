import { FC } from 'react';

import AddNew from '@/assets/images/add-new.png';
import { getWorkspaces } from './getWorkspaces';
import WorkspaceCard from '@/components/workspaces/WorkspaceCard';
import { Workspace } from '@/types';
import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { Grid, Heading, Wrapper } from '@/components/content-elements/default';
import { Role } from '@/components/content-elements/default/types';
import {
  Card,
  CardOverlay,
  CardWrapper,
  GradientOverlay,
  NameLabel,
} from '@/components/workspaces/WorkspaceCard.styles';
import Link from 'next/link';

const WorkspacesPage: FC = async () => {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
    redirect('/login');
  }
  const workspaces = await getWorkspaces();

  const plainWorkspaces = workspaces?.map((workspace: Workspace) => ({
    ...workspace,
    _id: workspace._id.toString(),
    access: workspace.access?.map(
      (entry: { userId: string; role: string }) => ({
        userId: String(entry.userId),
        role: entry.role,
      })
    ),
  }));

  return (
    <Wrapper>
      <Heading value="Workspaces" element="h1" />
      <Grid>
        {plainWorkspaces?.map((workspace: Workspace) => (
          <WorkspaceCard
            key={workspace._id.toString()}
            workspace={workspace}
            role={
              workspace.access
                ?.find((entry) => entry.userId === loggedInUser._id)
                ?.role.toLowerCase() as Role
            }
          />
        ))}
        <Link href={`/workspaces/neu`}>
          <CardWrapper selected={false}>
            <div>
              <Card $backgroundImage={AddNew.src}>
                <CardOverlay>
                  <NameLabel>Add new</NameLabel>
                  <GradientOverlay />
                </CardOverlay>
              </Card>
            </div>
          </CardWrapper>
        </Link>
      </Grid>
    </Wrapper>
  );
};

export default WorkspacesPage;
