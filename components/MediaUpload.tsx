'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { GalleryGrid, GalleryCollage } from './gallery';
import type { GalleryItem } from './gallery';
import MediaUploadArea, {
  MediaUploadResource,
} from './media-upload-area/MediaUploadArea';
import { Icon, Wrapper } from '@/components/content-elements/default';
import { useClientStorage } from '@/components/content-elements/default/utils/useLocalStorage';
import ResizableSplit from './ResizableSplit';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from './language-settings/languages';
import LanguageTabs, { TabItem } from './workspace-language-tabs/LanguageTabs';
import AiTranslationPreview from './ai-translate/AiTranslationPreview';
import DeleteConfirmModal from './delete-confirm-modal/DeleteConfirmModal';
import SaveButton, { SaveButtonStatus } from './save-button/SaveButton';
import { TranslateTarget } from './ai-translate/AiTranslate';

// --- Konfiguration Sprachen (später aus Workspace laden) ---

// Helper for date formatting
const formatDate = (isoString?: string) => {
  if (!isoString) return 'Unbekannt';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

// --- Layout / Basics ---

// Toolbar über dem Grid (Suche + Bulk Aktionen)
const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  flex: 1 1 200px;
  padding: 0.4rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
  font-size: 0.9rem;
`;

const BulkActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const BulkButton = styled.button`
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  border-radius: 0.3rem;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;

  &:hover {
    background: #e2e2e2;
  }
`;

const SelectionInfo = styled.span`
  font-size: 0.8rem;
  color: #555;
`;

// Sidebar / Metadaten-Form
const MetaTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
`;

const MetaInfo = styled.p`
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
  color: #555;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const Input = styled.input`
  padding: 0.4rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  background: #fff;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SmallButton = styled.button`
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 0.3rem;
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: pointer;

  &:hover {
    background: #e2e2e2;
  }
`;

const DangerButton = styled(SmallButton)`
  border-color: #cf222e;
  color: #cf222e;

  &:hover {
    background: #ffe3e0;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #eff6ff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 1rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


// --- Language Tabs ---

const LangTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`;

const LangTab = styled.button<{ $active: boolean }>`
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#0070f3' : '#ccc')};
  background: ${({ $active }) => ($active ? '#e6f0ff' : '#f5f5f5')};
  cursor: pointer;

  &:hover {
    border-color: #0070f3;
  }
`;



// --- Typen ---

type LocalizedField = Record<string, string>;

type MetaData = {
  alt: LocalizedField;
  title: LocalizedField;
  caption: LocalizedField;
  copyright: LocalizedField;
};

type MediaMeta = {
  alt?: LocalizedField;
  title?: LocalizedField;
  caption?: LocalizedField;
  copyright?: LocalizedField;
};

type MediaFile = MediaUploadResource & {
  alt?: string;
  title?: string;
  caption?: string;
  copyright?: string;
  meta?: MediaMeta; // mehrsprachige Meta aus Mongo
  created_at?: string;
  updated_at?: string;
  createdByName?: string;
  updatedByName?: string;
};

type CloudinaryListResponse = {
  resources?: MediaFile[];
};

// Antwort der KI-Meta-Route
type SuggestedMeta = {
  publicId: string;
  alt?: LocalizedField;
  title?: LocalizedField;
  caption?: LocalizedField;
  copyright?: LocalizedField;
};

const makeEmptyMeta = (): MetaData => ({
  alt: {},
  title: {},
  caption: {},
  copyright: {},
});

// nutzt zuerst file.meta aus Mongo, fällt sonst auf Cloudinary-context zurück
const getMetaFromFile = (file: MediaFile): MetaData => {
  const meta = makeEmptyMeta();

  // 1) Mehrsprachige Meta aus Mongo (file.meta)
  if (file.meta) {
    if (file.meta.alt) meta.alt = { ...file.meta.alt };
    if (file.meta.title) meta.title = { ...file.meta.title };
    if (file.meta.caption) meta.caption = { ...file.meta.caption };
    if (file.meta.copyright) meta.copyright = { ...file.meta.copyright };
  }

  // 2) Fallback: Cloudinary context.custom → auf de mappen
  const custom = file.context?.custom ?? {};
  const baseAlt = custom.alt ?? file.alt ?? '';
  const baseTitle = custom.title ?? file.title ?? '';
  const baseCaption = custom.caption ?? file.caption ?? '';
  const baseCopyright = custom.copyright ?? file.copyright ?? '';

  if (baseAlt && !meta.alt.de) meta.alt.de = baseAlt;
  if (baseTitle && !meta.title.de) meta.title.de = baseTitle;
  if (baseCaption && !meta.caption.de) meta.caption.de = baseCaption;
  if (baseCopyright && !meta.copyright.de) meta.copyright.de = baseCopyright;

  return meta;
};

// Helper: Wert für ein Feld + Sprache inkl. Fallback
const getValueForField = (
  meta: MetaData,
  field: keyof MetaData,
  lang: LanguageCode
): string => {
  const obj = meta[field] || {};
  return obj[lang] ?? obj.de ?? '';
};

// --- Komponente ---

// ... (imports remain)

type MediaPoolProps = {
  workspaceId: string;
  availableLanguages?: string[];
  initialViewMode?: 'grid' | 'collage';
  initialFiles?: MediaFile[];
};

export default function MediaPool({ workspaceId, availableLanguages = ['de'], initialViewMode = 'grid', initialFiles }: MediaPoolProps) {
  // If server provided initialFiles, use them directly
  const [files, setFiles] = useState<MediaFile[]>(initialFiles ?? []);
  const [metaById, setMetaById] = useState<Record<string, MetaData>>(() => {
    if (!initialFiles) return {};
    const m: Record<string, MetaData> = {};
    initialFiles.forEach((f) => { m[f.public_id] = getMetaFromFile(f); });
    return m;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatingMetaIds, setGeneratingMetaIds] = useState<string[]>([]);
  const [metaDirty, setMetaDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveButtonStatus>('idle');

  // When server provided initialFiles, clear loading after hydration
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setLoading(false);
    }
  }, [initialFiles]);


  // Filter languages
  const enabledLanguages = ALL_LANGUAGES.filter(l => availableLanguages.includes(l.code));

  const [mainLang, setMainLang] = useState<LanguageCode>(
    (availableLanguages[0] as LanguageCode) || DEFAULT_LANGUAGES[0]
  );
  
  const [activeLang, setActiveLang] = useState<LanguageCode>(
    (availableLanguages[0] as LanguageCode) || DEFAULT_LANGUAGES[0]
  );

  // AI Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [pendingAi, setPendingAi] = useState<{
    source: LanguageCode;
    target: TranslateTarget;
    // field -> { lang -> text }
    results: Record<string, Record<string, string>>; 
    targetLanguages: LanguageCode[];
  } | null>(null);

  const [filter, setFilter] = useState('');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [viewMode, setViewModeState] = useState<'grid' | 'collage'>(initialViewMode);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    type: 'single' | 'selected' | 'all';
    ids: string[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Save view mode to DB when user changes it
  const setViewMode = (mode: 'grid' | 'collage') => {
    setViewModeState(mode);
    fetch('/api/users/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaPoolViewMode: mode }),
    }).catch(console.error);
  };

  // Read AI translate source language reactively (synced with AiTranslate dropdown)
  const [aiSourceLang] = useClientStorage<string>('ai-translate-source', mainLang, 'local');

  // Client-side fetch fallback (only when no initialFiles provided)
  useEffect(() => {
    if (initialFiles) return; // skip — already have data from server

    const fetchImages = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await fetch(`/api/workspaces/${workspaceId}/media`);
        if (!res.ok) throw new Error('Fehler beim Laden der Medien');
        const data = (await res.json()) as CloudinaryListResponse;
        const resources = data.resources ?? [];

        setFiles(resources);

        const initialMeta: Record<string, MetaData> = {};
        resources.forEach((file) => {
          initialMeta[file.public_id] = getMetaFromFile(file);
        });
        setMetaById(initialMeta);
      } catch (err) {
        console.error(err);
        setLoadError('Medien konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      void fetchImages();
    }
  }, [workspaceId, initialFiles]);

  const getSrc = (file: MediaFile) => file.secure_url || file.url || '';

  const handleSelect = (publicId: string) => {
    setSelectedId(publicId);
    setMetaDirty(false);
    setSaveStatus('idle');
  };

  const currentMeta: MetaData =
    selectedId && metaById[selectedId] ? metaById[selectedId] : makeEmptyMeta();

  const handleChangeField = (
    field: keyof MetaData,
    lang: LanguageCode,
    value: string
  ) => {
    if (!selectedId) return;

    setMetaDirty(true);
    setSaveStatus('idle');

    setMetaById((prev) => {
      const prevMeta = prev[selectedId] ?? makeEmptyMeta();
      const prevFieldObj = prevMeta[field] ?? {};

      return {
        ...prev,
        [selectedId]: {
          ...prevMeta,
          [field]: {
            ...prevFieldObj,
            [lang]: value,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const file = files.find((f) => f.public_id === selectedId);
    if (!file) return;

    setSaveStatus('saving');

    const meta = metaById[selectedId] ?? makeEmptyMeta();

    const payload = {
      meta: {
        alt: meta.alt,
        title: meta.title,
        caption: meta.caption,
        copyright: meta.copyright,
      },
    };

    try {
      const encodedId = encodeURIComponent(file.public_id);
      const res = await fetch(
        `/api/workspaces/${workspaceId}/media/${encodedId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error('Update error:', errData);
        return;
      }

      // Lokalen State mit neuen Metadaten (de-Fallback) updaten
      setFiles((prev) =>
        prev.map((f) =>
          f.public_id === selectedId
            ? {
                ...f,
                context: {
                  ...(f.context ?? {}),
                  custom: {
                    ...(f.context?.custom ?? {}),
                    alt: meta.alt.de ?? '',
                    title: meta.title.de ?? '',
                    caption: meta.caption.de ?? '',
                    copyright: meta.copyright.de ?? '',
                  },
                },
              }
            : f
        )
      );

      setSaveStatus('saved');
      setMetaDirty(false);
    } catch (error) {
      console.error('Fehler beim Speichern der Metadaten:', error);
      setSaveStatus('idle');
    }
  };

  // Abbrechen: Metadaten für das aktuelle Bild auf den letzten "Server"-Stand zurücksetzen
  const handleCancel = () => {
    if (!selectedId) {
      return;
    }

    const file = files.find((f) => f.public_id === selectedId);
    if (file) {
      const originalMeta = getMetaFromFile(file);

      setMetaById((prev) => ({
        ...prev,
        [selectedId]: originalMeta,
      }));
    }

    setSelectedId(null);
    setMetaDirty(false);
    setSaveStatus('idle');
  };

  const deleteFiles = async (publicIds: string[]) => {
    if (publicIds.length === 0) return;
    const idsSet = new Set(publicIds);

    for (const publicId of publicIds) {
      try {
        const encodedId = encodeURIComponent(publicId);
        const res = await fetch(
          `/api/workspaces/${workspaceId}/media/${encodedId}`,
          {
            method: 'DELETE',
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error('Delete error for', publicId, errData);
        }
      } catch (err) {
        console.error('Delete request failed for', publicId, err);
      }
    }

    setFiles((prev) => prev.filter((f) => !idsSet.has(f.public_id)));
    setMetaById((prev) => {
      const copy = { ...prev };
      publicIds.forEach((id) => {
        delete copy[id];
      });
      return copy;
    });
    setCheckedIds((prev) => prev.filter((id) => !idsSet.has(id)));
    setSelectedId((prev) => (prev && idsSet.has(prev) ? null : prev));
  };


  const handleDeleteSingle = () => {
    if (!selectedId) return;
    setDeleteModal({ type: 'single', ids: [selectedId] });
  };

  const handleDeleteSelected = () => {
    if (checkedIds.length === 0) return;
    setDeleteModal({ type: 'selected', ids: [...checkedIds] });
  };

  const handleDeleteAll = () => {
    if (files.length === 0) return;
    setDeleteModal({ type: 'all', ids: files.map((f) => f.public_id) });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    await deleteFiles(deleteModal.ids);
    setIsDeleting(false);
    setDeleteModal(null);
  };



  const selectedFile = selectedId
    ? files.find((f) => f.public_id === selectedId) ?? null
    : null;

  const renderLangTabs = () => (
    <div style={{ marginBottom: '1rem' }}>
      <LanguageTabs
        tabs={tabs}
        activeKey={activeLang}
        onChange={(k) => setActiveLang(k)}
        sourceLanguageCode={mainLang}
        targetLanguageCode={activeLang}
        onTranslateClick={undefined}
        loading={isTranslating}
        mainLanguageCode={mainLang}
      />
      
      <AiTranslationPreview
        mode="html"
        activeLang={activeLang}
        expanded={previewExpanded}
        onToggleExpanded={() => setPreviewExpanded(p => !p)}
        suggestion={aiSuggestion}
        suggestionsCount={aiSuggestionCount}
        isTranslating={isTranslating}
        onRetry={() => {
          if (!pendingAi) return;
          const field = Object.keys(pendingAi.results)[0] as keyof MetaData;
          if (field) handleAiTranslateClick(field);
        }}
        onDiscardCurrent={handleDiscardAi}
        onApplyCurrent={handleApplyAi}
        onApplyAll={handleApplyAllAi}
        onDiscardAll={handleDiscardAllAi}
      />
    </div>
  );

  // --- Filter / Suche ---

  const normalizedFilter = filter.trim().toLowerCase();

  const passesFilter = (file: MediaFile): boolean => {
    if (!normalizedFilter) return true;

    const meta = metaById[file.public_id] ?? makeEmptyMeta();

    const parts: string[] = [];
    parts.push(file.public_id);

    if (file.secure_url) parts.push(file.secure_url);
    if (file.url) parts.push(file.url);
    if (file.alt) parts.push(file.alt);
    if (file.title) parts.push(file.title);
    if (file.caption) parts.push(file.caption);
    if (file.copyright) parts.push(file.copyright);

    if (file.context?.custom) {
      Object.values(file.context.custom).forEach((v) => {
        if (typeof v === 'string') parts.push(v);
      });
    }

    (['alt', 'title', 'caption', 'copyright'] as (keyof MetaData)[]).forEach(
      (field) => {
        const obj = meta[field];
        Object.values(obj).forEach((v) => parts.push(v));
      }
    );

    const haystack = parts.join(' ').toLowerCase();
    return haystack.includes(normalizedFilter);
  };

  const visibleIndices = files
    .map((_, index) => index)
    .filter((index) => {
      const file = files[index];
      if (!file) return false;
      const matches = passesFilter(file);
      const isCurrentlySelected =
        selectedId !== null && file.public_id === selectedId;
      return matches || isCurrentlySelected;
    });

  // --- Checkbox Auswahl ---

  const toggleChecked = (publicId: string) => {
    setCheckedIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId]
    );
  };

  // --- Upload + KI-Meta ---

  const handleUploadComplete = async (uploaded: MediaUploadResource[]) => {
    if (uploaded.length === 0) return;

    const casted = uploaded as MediaFile[];

    // neue Dateien nach vorne
    setFiles((prev) => [...casted, ...prev]);

    // Basis-Meta aus Cloudinary/Mongo konstruieren
    setMetaById((prev) => {
      const copy: Record<string, MetaData> = { ...prev };
      casted.forEach((file) => {
        if (!copy[file.public_id]) {
          copy[file.public_id] = getMetaFromFile(file);
        }
      });
      return copy;
    });

    // KI-Metadaten holen
    const newIds = casted.map((f) => f.public_id);
    try {
      setGeneratingMetaIds((prev) => [...prev, ...newIds]);
      const res = await fetch(`/api/workspaces/${workspaceId}/media/generate-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicIds: casted.map((f) => f.public_id),
          languages: enabledLanguages.map((l) => l.code),
        }),
      });

      if (!res.ok) {
        console.error('generate-meta error', await res.text());
        return;
      }
      
      const suggestedList = (await res.json()) as SuggestedMeta[];

      setMetaById((prev) => {
        const copy: Record<string, MetaData> = { ...prev };

        suggestedList.forEach((suggested) => {
          const id = suggested.publicId;
          const existing = copy[id] ?? makeEmptyMeta();

          copy[id] = {
            alt: { ...existing.alt, ...(suggested.alt ?? {}) },
            title: { ...existing.title, ...(suggested.title ?? {}) },
            caption: { ...existing.caption, ...(suggested.caption ?? {}) },
            copyright: {
              ...existing.copyright,
              ...(suggested.copyright ?? {}),
            },
          };
        });

        return copy;
      });
    } catch (err) {
      console.error('Fehler bei generate-meta:', err);
    } finally {
      setGeneratingMetaIds((prev) =>
        prev.filter((id) => !newIds.includes(id))
      );
    }
  };

  // --- ZIP Download ---

  const handleDownloadZip = async () => {
    if (checkedIds.length === 0) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/media/zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicIds: checkedIds }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error('ZIP download error:', errData);
        alert('Fehler beim Erstellen des ZIP-Archivs.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medienpool.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Download des ZIPs:', error);
    }
  };

  // --- Manual AI Translation ---

  const handleAiTranslateClick = async (
    field: keyof MetaData
  ) => {
    if (isTranslating || !selectedId) return;

    const source = (aiSourceLang || mainLang) as LanguageCode;
    const target = activeLang;

    if (source === target) return;

    setIsTranslating(true);
    setPendingAi(null);

    try {
      const text = getValueForField(currentMeta, field, source);
      if (!text || !text.trim()) {
         setIsTranslating(false);
         return;
      }

      const res = await fetch('/api/ai/translate-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: field,
          text,
          sourceLanguage: source,
          targetLanguages: [target],
        }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const data = (await res.json()) as Record<string, Record<string, string>>;
      const translations = data[field];

      if (translations && translations[target]) {
        setPendingAi({
            source,
            target,
            targetLanguages: [target],
            results: { [field]: translations }
        });
        setPreviewExpanded(true);
      }

    } catch (err) {
      console.error('AI Translate Error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyAi = () => {
    if (!pendingAi || !selectedId) return;

    // Wir übernehmen ALLE Ergebnisse für die AKTIVE Sprache
    // Oder beim "All apply" alle Sprachen?
    // Der Preview component unterscheidet "Apply Current" (activeLang) und "Apply All".
    // Hier implementieren wir Einzeln für ActiveLang.

    setMetaById((prev) => {
      const prevMeta = prev[selectedId] ?? makeEmptyMeta();
      const nextMeta = { ...prevMeta };

      (['alt', 'title', 'caption', 'copyright'] as const).forEach(field => {
        const fieldTrans = pendingAi.results[field];
        if (fieldTrans && fieldTrans[activeLang]) {
          nextMeta[field] = {
            ...(nextMeta[field] || {}),
            [activeLang]: fieldTrans[activeLang]
          };
        }
      });
      return { ...prev, [selectedId]: nextMeta };
    });

    // Clean up pending for activeLang
    const newResults: Record<string, Record<string, string>> = {};
    let hasRemaining = false;

    Object.entries(pendingAi.results).forEach(([field, transMap]) => {
      const newMap = { ...transMap };
      delete newMap[activeLang];
      if (Object.keys(newMap).length > 0) {
        newResults[field] = newMap;
        hasRemaining = true;
      }
    });

    const newTargets = pendingAi.targetLanguages.filter(l => l !== activeLang);

    if (hasRemaining && newTargets.length > 0) {
      setPendingAi({ ...pendingAi, results: newResults, targetLanguages: newTargets });
    } else {
      setPendingAi(null);
    }
  };
    
  const handleDiscardAi = () => {
    if (!pendingAi) return;
     // Clean up pending for activeLang
    const newResults: Record<string, Record<string, string>> = {};
    let hasRemaining = false;

    Object.entries(pendingAi.results).forEach(([field, transMap]) => {
      const newMap = { ...transMap };
      delete newMap[activeLang];
      if (Object.keys(newMap).length > 0) {
        newResults[field] = newMap;
        hasRemaining = true;
      }
    });

    const newTargets = pendingAi.targetLanguages.filter(l => l !== activeLang);

    if (hasRemaining && newTargets.length > 0) {
      setPendingAi({ ...pendingAi, results: newResults, targetLanguages: newTargets });
    } else {
      setPendingAi(null);
    }
  };
    
  const handleApplyAllAi = () => {
    if (!pendingAi || !selectedId) return;

    setMetaById((prev) => {
       const prevMeta = prev[selectedId] ?? makeEmptyMeta();
       const nextMeta = { ...prevMeta };

       Object.entries(pendingAi.results).forEach(([field, transMap]) => {
         const fKey = field as keyof MetaData;
         nextMeta[fKey] = {
           ...(nextMeta[fKey] || {}),
           ...transMap
         };
       });

       return { ...prev, [selectedId]: nextMeta };
    });
    setPendingAi(null);
  };

  const handleDiscardAllAi = () => {
    setPendingAi(null);
  };
  
  // Construct HTML suggestion for preview
  const getAiSuggestionHtml = () => {
    if (!pendingAi) return undefined;
    
    // Wir bauen eine Liste der Änderungen für activeLang
    const lines: string[] = [];
    (['alt', 'title', 'caption', 'copyright'] as const).forEach(field => {
       const val = pendingAi.results[field]?.[activeLang];
       if (val) {
         lines.push(`<li><strong>${field}:</strong> ${val}</li>`);
       }
    });

    if (lines.length === 0) return undefined;
    return `<ul>${lines.join('')}</ul>`;
  };

  const aiSuggestion = getAiSuggestionHtml();
  const aiSuggestionCount = pendingAi ? pendingAi.targetLanguages.length : 0; // rough count of "open languages"

  // Tabs definieren
  const tabs: TabItem[] = enabledLanguages.map(l => ({
    key: l.code,
    label: l.code.toUpperCase(),
    hasPendingSuggestion: pendingAi?.targetLanguages.includes(l.code)
  }));

  // Build area1Content (left panel = metadata settings)
  const area1Content = (
    <Wrapper data={{
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
          {!selectedFile ? (
            <MetaInfo>
              Kein Bild ausgewählt. Klicke rechts auf ein Bild, um Metadaten zu
              bearbeiten.
            </MetaInfo>
          ) : (
            <>
              <MetaTitle>Metadaten bearbeiten</MetaTitle>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', lineHeight: 1.3 }}>
                {getValueForField(currentMeta, 'title', 'de') || selectedFile.public_id?.split('/').pop() || 'Ohne Titel'}
              </h1>

              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#666' }}>
                 <div>
                    Hochgeladen am {formatDate(selectedFile.created_at)} 
                    {selectedFile.createdByName && ` von ${selectedFile.createdByName}`}
                 </div>
                 {selectedFile.updated_at && (selectedFile.updated_at !== selectedFile.created_at) && (
                   <div style={{ marginTop: 2 }}>
                      Zuletzt bearbeitet am {formatDate(selectedFile.updated_at)}
                      {selectedFile.updatedByName && ` von ${selectedFile.updatedByName}`}
                   </div>
                 )}
              </div>

              {generatingMetaIds.includes(selectedId!) && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <Spinner />
                  <MetaInfo>Generiere KI-Metadaten …</MetaInfo>
                </div>
              )}

              {renderLangTabs()}

              <Field>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Copyright
                  {activeLang !== mainLang && (
                    <IconButton
                      type="button"
                      onClick={() => handleAiTranslateClick('copyright')}
                      title={`Automatisch übersetzen von ${(aiSourceLang || mainLang).toUpperCase()} zu ${activeLang.toUpperCase()}`}
                      disabled={isTranslating}
                    >
                       <Icon name="MdAutoAwesome" size={16} />
                    </IconButton>
                  )}
                </div>
                <Input
                  value={getValueForField(currentMeta, 'copyright', activeLang)}
                  onChange={(e) => handleChangeField('copyright', activeLang, e.target.value)}
                />
              </Field>

              <Field>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Alt-Text
                  {activeLang !== mainLang && (
                    <IconButton
                      type="button"
                      onClick={() => handleAiTranslateClick('alt')}
                      title={`Automatisch übersetzen von ${(aiSourceLang || mainLang).toUpperCase()} zu ${activeLang.toUpperCase()}`}
                      disabled={isTranslating}
                    >
                       <Icon name="MdAutoAwesome" size={16} />
                    </IconButton>
                  )}
                </div>
                <Input
                  value={getValueForField(currentMeta, 'alt', activeLang)}
                  onChange={(e) => handleChangeField('alt', activeLang, e.target.value)}
                />
              </Field>

              <Field>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Title
                  {activeLang !== mainLang && (
                    <IconButton
                      type="button"
                      onClick={() => handleAiTranslateClick('title')}
                      title={`Automatisch übersetzen von ${(aiSourceLang || mainLang).toUpperCase()} zu ${activeLang.toUpperCase()}`}
                      disabled={isTranslating}
                    >
                       <Icon name="MdAutoAwesome" size={16} />
                    </IconButton>
                  )}
                </div>
                <Input
                  value={getValueForField(currentMeta, 'title', activeLang)}
                  onChange={(e) => handleChangeField('title', activeLang, e.target.value)}
                />
              </Field>

              <Field>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Caption
                  {activeLang !== mainLang && (
                    <IconButton
                      type="button"
                      onClick={() => handleAiTranslateClick('caption')}
                      title={`Automatisch übersetzen von ${(aiSourceLang || mainLang).toUpperCase()} zu ${activeLang.toUpperCase()}`}
                      disabled={isTranslating}
                    >
                       <Icon name="MdAutoAwesome" size={16} />
                    </IconButton>
                  )}
                </div>
                <Input
                  value={getValueForField(currentMeta, 'caption', activeLang)}
                  onChange={(e) => handleChangeField('caption', activeLang, e.target.value)}
                />
              </Field>

              <ButtonRow>
                <SaveButton
                  status={saveStatus}
                  hasChanges={metaDirty}
                  onClick={handleSave}
                />
                <SmallButton type="button" onClick={handleCancel}>
                  Abbrechen
                </SmallButton>
                <DangerButton type="button" onClick={handleDeleteSingle}>
                  Bild löschen
                </DangerButton>
              </ButtonRow>
            </>
          )}
        </>
      ),
    }} />
  );

  // Build gallery items for Area 2
  const galleryItems: GalleryItem[] = visibleIndices
    .map((index) => files[index])
    .filter(Boolean)
    .map((file) => {
      const meta = metaById[file.public_id];
      const altDe = meta?.alt?.de || '';
      return {
        id: file.public_id,
        src: getSrc(file),
        width: file.width ?? 1,
        height: file.height ?? 1,
        label: altDe || file.public_id,
        format: file.format,
      };
    });

  const galleryProps = {
    items: galleryItems,
    selectedId: selectedId ?? undefined,
    onSelect: handleSelect,
    selectable: true,
    checkedIds,
    onToggleCheck: toggleChecked,
  };

  return (
    <>
    <ResizableSplit
      direction="horizontal"
      storageKey="media-pool-split"
      availableLanguages={enabledLanguages.map((l) => l.code) as LanguageCode[]}
      area1Content={area1Content}
      area1Style={{ overflowY: 'auto' }}
      area2Style={{ overflow: 'hidden' }}
      renderArea2={() => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Upload zone */}
          <div style={{ padding: '16px 16px 0' }}>
            {loadError && (
              <MetaInfo style={{ color: '#b00020' }}>{loadError}</MetaInfo>
            )}
            <MediaUploadArea
              multiple
              languages={enabledLanguages.map((l) => l.code)}
              onUploadComplete={handleUploadComplete}
              workspaceId={workspaceId}
            />
          </div>

          {/* Toolbar: Search + View mode + Bulk actions */}
          <div style={{ padding: '12px 16px 0' }}>
            <Toolbar>
              <SearchInput
                type="text"
                placeholder="Suche nach ID, Text oder Metadaten …"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <select
                aria-label="Anzeigemodus"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'grid' | 'collage')}
                style={{
                  padding: '0.35rem 0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  fontSize: '0.85rem',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <option value="grid">Raster</option>
                <option value="collage">Collage</option>
              </select>

              {checkedIds.length > 0 && (
                <BulkActions>
                  <SelectionInfo>{checkedIds.length} ausgewählt</SelectionInfo>
                  <BulkButton type="button" onClick={handleDeleteSelected}>
                    Auswahl löschen
                  </BulkButton>
                  <BulkButton type="button" onClick={handleDownloadZip}>
                    Download ZIP
                  </BulkButton>
                  <BulkButton type="button" onClick={() => setCheckedIds(files.map(f => f.public_id))}>
                    Alle ({files.length}) auswählen
                  </BulkButton>
                  <BulkButton type="button" onClick={() => setCheckedIds([])}>
                    Auswahl ({checkedIds.length}) aufheben
                  </BulkButton>
                </BulkActions>
              )}
            </Toolbar>
          </div>

          {/* Scrollable gallery */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
            {loading || (files.length === 0 && !loadError) ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 200,
                gap: 12,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#0070f3',
                  animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ fontSize: '0.85rem', color: '#888' }}>Lade Medien …</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : viewMode === 'collage'
              ? <GalleryCollage {...galleryProps} />
              : <GalleryGrid {...galleryProps} />}
          </div>
        </div>
      )}
    />

    <DeleteConfirmModal
      isOpen={deleteModal !== null}
      title={
        deleteModal?.type === 'single'
          ? 'Bild löschen'
          : deleteModal?.type === 'selected'
          ? `${deleteModal.ids.length} Bilder löschen`
          : `Alle ${deleteModal?.ids.length ?? 0} Bilder löschen`
      }
      message={
        deleteModal?.type === 'single'
          ? 'Möchtest Du dieses Bild wirklich unwiderruflich löschen?'
          : deleteModal?.type === 'selected'
          ? `Möchtest Du die ${deleteModal.ids.length} ausgewählten Bilder wirklich unwiderruflich löschen?`
          : `Möchtest Du wirklich ALLE ${deleteModal?.ids.length ?? 0} Bilder im Medienpool unwiderruflich löschen?`
      }
      isLoading={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={() => setDeleteModal(null)}
    />
    </>
  );
}
