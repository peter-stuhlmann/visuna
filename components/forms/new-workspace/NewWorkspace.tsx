'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceEditForm from '../WorkspaceEditForm';

const AddNewWorkspaceForm: FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]); // 👈 NEU
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Submitting new workspace:', {
      name,
      domain,
      users,
      imageFile,
    });

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('domain', domain);

      // 👇 Users mitgeben
      formData.append('users', JSON.stringify(users));

      if (imageFile) {
        formData.append('thumbnail', imageFile);
      }

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        alert(err?.message || 'Ein Fehler ist aufgetreten.');
        setIsLoading(false);
        return;
      }

      console.log('Workspace erfolgreich erstellt.');

      router.push(`/workspaces`);
    } catch (error) {
      console.error(error);
      alert('Ein unerwarteter Fehler ist aufgetreten.');
      setIsLoading(false);
    }
  };

  return (
    <WorkspaceEditForm
      handleSubmit={handleSubmit}
      buttonLabel={isLoading ? 'Erstellen...' : 'Workspace erstellen'}
      name={name}
      setName={setName}
      domain={domain}
      setDomain={setDomain}
      users={users} // 👈 NEU
      setUsers={setUsers} // 👈 NEU
      setImageFile={setImageFile}
    />
  );
};

export default AddNewWorkspaceForm;
