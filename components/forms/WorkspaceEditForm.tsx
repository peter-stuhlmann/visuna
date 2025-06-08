'use client';

import { FC, FormEvent, useRef, useState, DragEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/content-elements/default';
import TextInput from '@/components/content-elements/default/inputs/text';

type WorkspaceEditFormProps = {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  setImageFile: (file: File) => void;
  buttonLabel: string;
};

const WorkspaceEditForm: FC<WorkspaceEditFormProps> = ({
  handleSubmit,
  name,
  setName,
  setImageFile,
  buttonLabel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Datei verarbeiten und Vorschau erstellen
  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Wenn die Datei über den Input ausgewählt wird
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Drag & Drop Ereignisse
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

  // Klick auf den Drop-Bereich öffnet den Datei-Explorer
  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <TextInput label="Name" value={name} onChange={setName} type="text" />
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
