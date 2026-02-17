'use client';

import React, { FC, FormEvent, useRef, useState, DragEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/content-elements/default';
import TextInput from '@/components/content-elements/default/inputs/text-input';
import BubbleArrayInput from '../blocks/bubble-array-input/BubbleArrayInput';

type WorkspaceEditFormProps = {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  name: string;
  setName: (name: string) => void;

  domain: string;
  setDomain: (domain: string) => void;

  users?: string[];
  setUsers?: (users: string[]) => void;

  setImageFile: (file: File) => void;
  buttonLabel: string;
};

const WorkspaceEditForm: FC<WorkspaceEditFormProps> = ({
  handleSubmit,
  name,
  setName,
  domain,
  setDomain,
  users,
  setUsers,
  setImageFile,
  buttonLabel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <TextInput
        id="workspace-name"
        label="Name"
        value={name}
        onChange={(value) => setName(value)}
        type="text"
      />

      <TextInput
        id="workspace-domain"
        label="Domain"
        value={domain}
        onChange={(value) => setDomain(value)}
        type="text"
      />

      {/* 👇 NEU: User Bubble Input - Nur anzeigen, wenn users/setUsers props da sind */}
      {users && setUsers && (
        <div>
          <label style={{ fontSize: 14, marginBottom: 4, display: 'block' }}>
            User hinzufügen (E-Mail, Enter drücken)
          </label>

          <BubbleArrayInput
            value={users}
            onChange={setUsers}
            placeholder="user@example.com"
          />
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '1rem',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <div>
          Ziehe ein Bild hierher oder klicke hier, um den Explorer zu öffnen
        </div>

        {previewUrl && (
          <div>
            <Image
              src={previewUrl}
              alt="Bildvorschau"
              width={500}
              height={500}
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileInputChange}
      />

      <Button type="submit" variant="contained">
        {buttonLabel}
      </Button>
    </form>
  );
};

export default WorkspaceEditForm;
