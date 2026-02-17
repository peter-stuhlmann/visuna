'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceEditForm from '../WorkspaceEditForm';
import { Workspace } from '@/lib/workspaces/workspaces.types';

type EditWorkspaceProps = {
  workspace: Workspace;
};

const EditWorkspace: FC<EditWorkspaceProps> = ({ workspace }) => {
  const router = useRouter();
  const [name, setName] = useState<string>(workspace.name);
  const [domain, setDomain] = useState<string>(workspace.domain || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('domain', domain);

      if (imageFile) {
        formData.append('thumbnail', imageFile);
      }

      const response = await fetch(`/api/workspaces/${workspace._id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        alert(err?.message || 'Ein Fehler ist aufgetreten.');
        setIsLoading(false);
        return;
      }

      router.push('/workspaces');
    } catch (error) {
      console.error(error);
      alert('Ein unerwarteter Fehler ist aufgetreten.');
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
      domain={domain}
      setDomain={setDomain}
      setImageFile={setImageFile}
    />
  );
};

export default EditWorkspace;
