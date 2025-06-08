'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Workspace } from '@/types';
import WorkspaceEditForm from '../WorkspaceEditForm';

type EditWorkspaceProps = {
  workspace: Workspace;
};

const EditWorkspace: FC<EditWorkspaceProps> = ({ workspace }) => {
  const router = useRouter();
  const [name, setName] = useState<string>(workspace.name);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('id', workspace._id.toString());
      formData.append('name', name);
      if (imageFile) {
        formData.append('thumbnail', imageFile);
      }

      const response = await fetch('/api/update-workspace', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // const errorData = await response.json();
        // setErrorMessage(errorData.message || 'Ein Fehler ist aufgetreten.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data._id) {
        router.push(`/workspaces`);
      }
    } catch (error) {
      console.error(error);
      // setErrorMessage('Ein unerwarteter Fehler ist aufgetreten.');
      setIsLoading(false);
    }
  };

  return (
    <WorkspaceEditForm
      handleSubmit={handleSubmit}
      buttonLabel={
        isLoading ? 'Änderungen werden gespeichert...' : 'Änderungen speichern'
      }
      name={name}
      setName={setName}
      setImageFile={setImageFile}
    />
  );
};

export default EditWorkspace;
