'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceEditForm from '../WorkspaceEditForm';

const AddNewWorkspaceForm: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) {
        formData.append('thumbnail', imageFile);
      }

      const response = await fetch('/api/new-workspace', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // const errorData = await response.json();
        // setErrorMessage(errorData.message || 'Ein Fehler ist aufgetreten.');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
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
      buttonLabel={isLoading ? 'Erstellen...' : 'Workspace erstellen'}
      name={name}
      setName={setName}
      setImageFile={setImageFile}
    />
  );
};

export default AddNewWorkspaceForm;
