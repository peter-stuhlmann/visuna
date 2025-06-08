import { FC } from 'react';
import AddNewWorkspaceForm from '@/components/forms/new-workspace';
import isUserLoggedIn from '@/utils/isUserLoggedIn';
import { redirect } from 'next/navigation';
import { Heading, Wrapper } from '@/components/content-elements/default';

const AddNewWorkspacePage: FC = async () => {
  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }

  return (
    <Wrapper>
      <Heading value="Lege einen neuen Workspace an" element="h1" />
      <AddNewWorkspaceForm />
    </Wrapper>
  );
};

export default AddNewWorkspacePage;
