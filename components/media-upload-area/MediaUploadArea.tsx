'use client';

import React, { useRef, useState } from 'react';
import Lightbox from '../gallery/Lightbox';

// Basis-Typ für alles, was aus /api/workspaces/[id]/media zurückkommt
export type MediaUploadResource = {
  public_id: string;
  secure_url?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  context?: {
    custom?: Record<string, string | undefined>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

// KI-Metadaten (Response von /api/media/generate-meta)
export type SuggestedMeta = {
  publicId: string;
  alt: Record<string, string>;
  title: Record<string, string>;
  caption: Record<string, string>;
  copyright: Record<string, string>;
};

type SimilarImage = {
  publicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  distance: number;
};

type PendingFile = {
  file: File;
  similarImages: SimilarImage[];
};

type MediaUploadAreaProps = {
  multiple?: boolean;
  onUploadComplete?: (uploaded: MediaUploadResource[]) => void;
  workspaceId?: string;
  languages?: string[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const ACCEPTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'];

const MediaUploadArea: React.FC<MediaUploadAreaProps> = ({
  multiple = false,
  onUploadComplete,
  workspaceId,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate confirmation dialog state
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [currentPendingIdx, setCurrentPendingIdx] = useState(0);
  const [confirmedFiles, setConfirmedFiles] = useState<File[]>([]);

  // Lightbox for duplicate preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openFileDialog = () => {
    if (isUploading || isChecking) return;
    inputRef.current?.click();
  };

  /** Actually upload files (after duplicate check / confirmation) */
  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploaded: MediaUploadResource[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/workspaces/${workspaceId}/media`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          let friendlyMessage = 'Upload fehlgeschlagen.';

          try {
            const json = JSON.parse(text);
            if (json.error) {
              if (json.error === 'Upload failed') {
                friendlyMessage = `Ungültiges Bildformat! Bitte ${ACCEPTED_FORMATS.join(
                  ', '
                )} hochladen.`;
              } else if (String(json.error).includes('File size')) {
                friendlyMessage = 'Datei ist zu groß.';
              } else {
                friendlyMessage = `Fehler: ${json.error}`;
              }
            } else {
              friendlyMessage = `Fehler: ${text || res.statusText}`;
            }
          } catch {
            friendlyMessage = `Fehler: ${text || res.statusText}`;
          }

          throw new Error(friendlyMessage);
        }

        const json = (await res.json()) as MediaUploadResource;
        if (!json.public_id) {
          console.warn('Upload-Antwort ohne public_id:', json);
        }
        uploaded.push(json);
      }

      onUploadComplete?.(uploaded);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Upload fehlgeschlagen. Bitte versuche es erneut.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  /** Check for duplicates, then upload or show dialog */
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (!workspaceId) {
      setError('Workspace ID fehlt - Upload nicht möglich.');
      return;
    }

    const files = Array.from(fileList);
    const selected = multiple ? files : [files[0]];

    // Size checks
    let totalSize = 0;
    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" ist größer als 5 MB und wird ignoriert.`);
        return;
      }
      totalSize += file.size;
    }
    if (totalSize > MAX_TOTAL_SIZE) {
      setError(
        'Die Gesamtgröße aller Dateien darf 50 MB pro Upload nicht überschreiten.'
      );
      return;
    }

    setError(null);
    setIsChecking(true);

    try {
      // Check each file for duplicates
      const pending: PendingFile[] = [];
      const noConflict: File[] = [];

      for (const file of selected) {
        // Only check image files (not PDFs)
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext === 'pdf' || ext === 'svg') {
          noConflict.push(file);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch(
            `/api/workspaces/${workspaceId}/media/check-duplicates`,
            { method: 'POST', body: formData }
          );

          if (res.ok) {
            const data = await res.json();
            if (data.similar && data.similar.length > 0) {
              pending.push({ file, similarImages: data.similar });
            } else {
              noConflict.push(file);
            }
          } else {
            // If check fails, allow upload anyway
            noConflict.push(file);
          }
        } catch {
          // If check fails, allow upload anyway
          noConflict.push(file);
        }
      }

      if (pending.length === 0) {
        // No duplicates found → upload all directly
        setIsChecking(false);
        await uploadFiles(noConflict);
      } else {
        // Show confirmation dialog for files with duplicates
        setConfirmedFiles(noConflict);
        setPendingFiles(pending);
        setCurrentPendingIdx(0);
        setIsChecking(false);
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
      setIsChecking(false);
      // On error, upload without checking
      await uploadFiles(selected);
    }
  };

  /** User confirms: upload this file despite duplicates */
  const handleConfirmUpload = () => {
    const current = pendingFiles[currentPendingIdx];
    if (!current) return;

    const nextConfirmed = [...confirmedFiles, current.file];

    if (currentPendingIdx + 1 < pendingFiles.length) {
      // More pending files to confirm
      setConfirmedFiles(nextConfirmed);
      setCurrentPendingIdx(currentPendingIdx + 1);
    } else {
      // All confirmed → upload
      setPendingFiles([]);
      setCurrentPendingIdx(0);
      setConfirmedFiles([]);
      void uploadFiles(nextConfirmed);
    }
  };

  /** User skips: don't upload this file */
  const handleSkipUpload = () => {
    if (currentPendingIdx + 1 < pendingFiles.length) {
      setCurrentPendingIdx(currentPendingIdx + 1);
    } else {
      // Done with all pending files → upload whatever was confirmed
      const toUpload = [...confirmedFiles];
      setPendingFiles([]);
      setCurrentPendingIdx(0);
      setConfirmedFiles([]);
      if (toUpload.length > 0) {
        void uploadFiles(toUpload);
      }
    }
  };

  /** Cancel all pending */
  const handleCancelAll = () => {
    const toUpload = [...confirmedFiles];
    setPendingFiles([]);
    setCurrentPendingIdx(0);
    setConfirmedFiles([]);
    if (toUpload.length > 0) {
      void uploadFiles(toUpload);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    void handleFiles(e.dataTransfer?.files ?? null);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    void handleFiles(e.target.files);
    e.target.value = '';
  };

  const currentPending = pendingFiles[currentPendingIdx];

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={ACCEPTED_FORMATS.join(',')}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />

      <div
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: '1px dashed #ccc',
          borderRadius: 6,
          padding: 12,
          background: isDragging ? '#eef6ff' : '#fafafa',
          cursor: isUploading || isChecking ? 'default' : 'pointer',
          opacity: isUploading || isChecking ? 0.7 : 1,
          fontSize: 13,
          color: '#555',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ fontWeight: 600 }}>Dateien hier ablegen oder klicken</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Max. 5 MB pro Datei, insgesamt 50 MB pro Upload.
          {multiple
            ? ' Mehrere Dateien sind erlaubt.'
            : ' Es wird nur die erste Datei verwendet.'}
        </div>

        {isChecking && (
          <div style={{ fontSize: 12, marginTop: 4 }}>Prüfe auf ähnliche Bilder …</div>
        )}

        {isUploading && (
          <div style={{ fontSize: 12, marginTop: 4 }}>Upload läuft …</div>
        )}

        {error && (
          <div
            style={{
              fontSize: 12,
              marginTop: 4,
              color: '#b00020',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Duplicate Confirmation Dialog */}
      {currentPending && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCancelAll}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 520,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>
              Ähnliches Bild gefunden
            </h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#555' }}>
              Für <strong>&quot;{currentPending.file.name}&quot;</strong>{' '}
              {currentPending.similarImages.length === 1
                ? 'wurde ein ähnliches Bild'
                : `wurden ${currentPending.similarImages.length} ähnliche Bilder`}{' '}
              im Medienpool gefunden:
            </p>

            {/* Thumbnails of similar images */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {currentPending.similarImages.map((img) => {
                const ar =
                  img.width && img.height ? img.width / img.height : 1;
                const displayHeight = 180;
                const displayWidth = Math.round(ar * displayHeight);

                return (
                  <div
                    key={img.publicId}
                    style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb',
                      flexShrink: 0,
                      background: '#f9f9f9',
                      cursor: 'zoom-in',
                      maxWidth: '100%',
                    }}
                    onClick={() => setPreviewUrl(img.secureUrl)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ähnliches Bild vergrößern`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPreviewUrl(img.secureUrl);
                      }
                    }}
                  >
                    <img
                      src={img.secureUrl}
                      alt={`Ähnliches Bild: ${img.publicId}`}
                      style={{
                        width: displayWidth,
                        height: displayHeight,
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {pendingFiles.length > 1 && (
              <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 0.75rem' }}>
                Datei {currentPendingIdx + 1} von {pendingFiles.length}
              </p>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleSkipUpload}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                Überspringen
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  borderRadius: 6,
                  border: '1px solid #2563eb',
                  background: '#2563eb',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Trotzdem hochladen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for duplicate preview */}
      {previewUrl && (
        <Lightbox
          src={previewUrl}
          alt="Vorschau des ähnlichen Bildes"
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default MediaUploadArea;
