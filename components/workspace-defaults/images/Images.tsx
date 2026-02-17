// components/workspace-defaults/WorkspaceImageDefaultsSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ImageInputBlock, {
  ImageValue,
} from '@/components/blocks/ImageInputBlock';

type WorkspaceImageDefaultsSectionProps = {
  workspaceId: string;
};

type GetImageResponse = {
  workspaceId: string;
  fallbackImage: ImageValue | null;
};

const WorkspaceImageDefaultsSection: React.FC<
  WorkspaceImageDefaultsSectionProps
> = ({ workspaceId }) => {
  const [image, setImage] = useState<ImageValue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initial laden
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setSaveMessage(null);

      try {
        const res = await fetch(
          `/api/workspace-defaults/images/get-fallback-image?workspaceId=${encodeURIComponent(
            workspaceId
          )}`
        );

        if (!res.ok) {
          console.error(
            'workspace-defaults/images/get-image error',
            res.status,
            await res.text().catch(() => '')
          );
          if (!cancelled) {
            setError('Standard-Bild konnte nicht geladen werden.');
            setImage(null);
          }
          return;
        }

        const data = (await res.json()) as GetImageResponse;

        if (!cancelled) {
          setImage(data.fallbackImage ?? null);
        }
      } catch (err) {
        console.error('Fehler beim Laden des Default-Bildes:', err);
        if (!cancelled) {
          setError('Standard-Bild konnte nicht geladen werden.');
          setImage(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleChange = (next: ImageValue) => {
    setImage(next);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!workspaceId) return;

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await fetch(
        '/api/workspace-defaults/images/save-fallback-image',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId,
            fallbackImage: image, // <— WICHTIG: neues Feld
          }),
        }
      );

      if (!res.ok) {
        console.error(
          'workspace-defaults/images/save error',
          res.status,
          await res.text().catch(() => '')
        );
        setError('Standard-Bild konnte nicht gespeichert werden.');
        return;
      }

      setSaveMessage('Standard-Bild wurde gespeichert.');
    } catch (err) {
      console.error('Fehler beim Speichern des Default-Bildes:', err);
      setError('Standard-Bild konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      style={{
        marginTop: '1.5rem',
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
      }}
    >
      <h2
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Standard-Bild für diesen Workspace
      </h2>

      <p
        style={{
          fontSize: 13,
          color: '#555',
          marginBottom: 12,
          maxWidth: 520,
        }}
      >
        Dieses Bild wird als Fallback verwendet, wenn in einem Element eine
        ungültige oder fehlende Bild-URL hinterlegt ist.
      </p>

      {isLoading && (
        <p style={{ fontSize: 13, color: '#777' }}>Lade aktuelles Bild …</p>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#b00020', marginBottom: 8 }}>
          {error}
        </p>
      )}

      {!isLoading && (
        <div style={{ marginBottom: 12 }}>
          <ImageInputBlock
            value={image ?? {}}
            onChange={handleChange}
            label="Fallback-Bild"
            workspaceId={workspaceId}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          style={{
            padding: '8px 14px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: isSaving ? '#ddd' : '#f5f5f5',
            fontSize: 13,
            cursor: isSaving || isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Speichere …' : 'Standard-Bild speichern'}
        </button>

        {saveMessage && (
          <span style={{ fontSize: 12, color: '#2e7d32' }}>{saveMessage}</span>
        )}
      </div>
    </section>
  );
};

export default WorkspaceImageDefaultsSection;
