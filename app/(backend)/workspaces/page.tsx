import { FC } from 'react';

import AddNew from '@/assets/images/add-new.png';
import { getWorkspaces } from './getWorkspaces';
import WorkspaceCard from '@/components/workspaces/WorkspaceCard';
import { redirect } from 'next/navigation';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import {
  Breadcrumbs,
  Grid,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { Role } from '@/components/content-elements/default/types';
import {
  Card,
  CardOverlay,
  CardWrapper,
  GradientOverlay,
  NameLabel,
} from '@/components/workspaces/WorkspaceCard.styles';
import Link from 'next/link';
import Spacer from '@/components/content-elements/default/spacer';

const WorkspacesPage: FC = async () => {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
    redirect('/login');
  }

  const workspaces = await getWorkspaces();

  // ✅ Wichtig: erst NACH Login laden und dann hier entscheiden
  if (!workspaces || workspaces.length === 0) {
    redirect('/workspaces/neu');
  }

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
          },
          links: [
            {
              label: { de: 'Workspaces', en: 'Workspaces' },
              highlighted: true,
            },
          ],
        }}
      />

      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading value="Workspaces" element="h1" />

              <Spacer data={{ size: 's' }} />
              <Grid>
                {workspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace._id}
                    workspace={workspace}
                    role={
                      workspace.access
                        ?.find((entry) => entry.userId === loggedInUser._id)
                        ?.role.toLowerCase() as Role
                    }
                  />
                ))}

                <Link href={`/workspaces/neu`}>
                  <CardWrapper $selected={false}>
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
            </>
          ),
        }}
      />
    </>
  );
};

export default WorkspacesPage;
