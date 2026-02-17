'use client';

import React, { FC, useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BlockWrapper } from './BlockWrapper.styles';
import MediaUploadArea, {
  MediaUploadResource,
  SuggestedMeta,
} from '../media-upload-area/MediaUploadArea';
import LanguageTabs, { TabItem } from '../workspace-language-tabs/LanguageTabs';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '../language-settings/languages';

type LocalizedText = Record<string, string>;

export type ImageValue = {
  src?: string;
  alt?: LocalizedText;
  width?: number;
  height?: number;
  copyright?: LocalizedText;
  caption?: LocalizedText;
  className?: string;
};

type ImageInputBlockProps = {
  value: ImageValue | unknown; // robust gegen falsche Typen / alte Daten
  onChange: (value: ImageValue) => void;
  label?: string;
  /** optional, falls du sie explizit durchreichen willst – sonst wird sie aus der URL gelesen */
  workspaceId?: string;
};

// Typ für Medienpool-API (inkl. optionaler Meta aus Mongo)
type CloudinaryResource = MediaUploadResource & {
  meta?: {
    alt?: Record<string, string>;
    title?: Record<string, string>;
    caption?: Record<string, string>;
    copyright?: Record<string, string>;
  };
};

type CloudinaryListResponse = {
  resources?: CloudinaryResource[];
};

// --- Normalisierung / Helper ---

const isImageValue = (v: unknown): v is ImageValue =>
  !!v && typeof v === 'object';

const normalizeLocalized = (v: unknown): LocalizedText => {
  if (!v) return {};
  if (typeof v === 'string') {
    // alte Daten: String → als DEFAULT_LANGUAGES[0] interpretieren
    const trimmed = v.trim();
    return trimmed ? { de: trimmed } : {};
  }
  if (typeof v === 'object') {
    const result: LocalizedText = {};
    Object.entries(v as Record<string, unknown>).forEach(([k, val]) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed) {
          result[k] = val; // ursprünglichen String behalten
        }
      }
    });
    return result;
  }
  return {};
};

const coerceToImageValue = (v: ImageValue | unknown): ImageValue => {
  if (isImageValue(v)) {
    const obj = v as ImageValue & {
      alt?: unknown;
      caption?: unknown;
      copyright?: unknown;
    };
    return {
      ...obj,
      alt: normalizeLocalized(obj.alt),
      caption: normalizeLocalized(obj.caption),
      copyright: normalizeLocalized(obj.copyright),
    };
  }
  return {};
};

const getLocalized = (
  map: LocalizedText | undefined,
  lang: LanguageCode
): string => {
  if (!map) return '';
  // später könnte hier mainLanguage als Fallback statt DEFAULT_LANGUAGES[0] kommen
  return map[lang] ?? map.de ?? '';
};

const setLocalized = (
  map: LocalizedText | undefined,
  lang: LanguageCode,
  value: string
): LocalizedText => {
  const next: LocalizedText = { ...(map ?? {}) };
  const trimmed = value.trim();

  if (trimmed) {
    // Wert so speichern wie eingegeben (inkl. Spaces), nur komplett leer löschen
    next[lang] = value;
  } else {
    delete next[lang];
  }

  return next;
};

const mergeLocalized = (
  existing?: LocalizedText,
  fromMedia?: LocalizedText,
  fromSuggested?: LocalizedText
): LocalizedText => {
  const result: LocalizedText = { ...(existing ?? {}) };

  // Cloudinary / Media-Fallback (nur setzen, wenn nichts existiert)
  if (fromMedia) {
    Object.entries(fromMedia).forEach(([lang, val]) => {
      if (typeof val === 'string' && val.trim() && !result[lang]) {
        result[lang] = val;
      }
    });
  }

  // KI-Vorschläge (überschreiben vorhandene Werte)
  if (fromSuggested) {
    Object.entries(fromSuggested).forEach(([lang, val]) => {
      if (typeof val === 'string' && val.trim()) {
        result[lang] = val;
      }
    });
  }

  return result;
};

// Metadaten aus einem Resource-Objekt ziehen (Mongo-Meta + Cloudinary-Fallback)
const getMetaFromResource = (resource: CloudinaryResource) => {
  const alt: LocalizedText = {};
  const caption: LocalizedText = {};
  const copyright: LocalizedText = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyRes = resource as any;
  const meta = anyRes.meta as
    | {
        alt?: Record<string, string>;
        caption?: Record<string, string>;
        copyright?: Record<string, string>;
      }
    | undefined;

  if (meta?.alt) {
    Object.entries(meta.alt).forEach(([lang, v]) => {
      if (typeof v === 'string' && v.trim()) alt[lang] = v;
    });
  }
  if (meta?.caption) {
    Object.entries(meta.caption).forEach(([lang, v]) => {
      if (typeof v === 'string' && v.trim()) caption[lang] = v;
    });
  }
  if (meta?.copyright) {
    Object.entries(meta.copyright).forEach(([lang, v]) => {
      if (typeof v === 'string' && v.trim()) copyright[lang] = v;
    });
  }

  // Fallback: Cloudinary context.custom → auf de mappen, wenn nichts da
  const custom = resource.context?.custom ?? {};
  if (typeof custom.alt === 'string' && custom.alt.trim() && !alt.de) {
    alt.de = custom.alt;
  }
  if (
    typeof custom.caption === 'string' &&
    custom.caption.trim() &&
    !caption.de
  ) {
    caption.de = custom.caption;
  }
  if (
    typeof custom.copyright === 'string' &&
    custom.copyright.trim() &&
    !copyright.de
  ) {
    copyright.de = custom.copyright;
  }

  return { alt, caption, copyright };
};

// Hilfsfunktion: ist das eine „brauchbare“ URL?
// (wir nutzen new URL(..., base), aber nur in try/catch, damit es nicht crasht)
const isValidUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    if (typeof window !== 'undefined') {
      // Relativ oder absolut – beides okay
      // new URL erlaubt relative URLs mit Base
      // (z.B. "/foo/bar" + window.location.origin)
      // Wenn dein restlicher Code nur absolute HTTPS-URLs mag,
      // könntest du hier zusätzlich prüfen, ob es mit http/https startet.
      // eslint-disable-next-line no-new
      new URL(trimmed, window.location.origin);
    } else {
      // SSR-Fallback: sehr grobe Prüfung
      if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const ImageInputBlock: FC<ImageInputBlockProps> = ({
  value,
  onChange,
  label,
  workspaceId,
}) => {
  const pathname = usePathname();
  const current = coerceToImageValue(value);

  // Lokaler Draft für src, damit du "h", "ht", "htt" tippen kannst,
  // ohne sofort eine ungültige URL in die Datenstruktur zu schieben.
  const [draftSrc, setDraftSrc] = useState<string>(current.src ?? '');

  // Workspace-ID aus Prop oder URL lesen
  const inferredWorkspaceId = useMemo(() => {
    if (workspaceId && workspaceId.trim()) return workspaceId.trim();

    // Beispiel: /workspaces/{id}/...
    const match = pathname.match(/\/workspaces\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return undefined;
  }, [workspaceId, pathname]);

  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageCode[]>(DEFAULT_LANGUAGES);
  const [activeLang, setActiveLang] = useState<LanguageCode>(
    DEFAULT_LANGUAGES[0]
  );

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<CloudinaryResource[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // draftSrc synchronisieren, falls current.src sich von außen ändert
  useEffect(() => {
    setDraftSrc(current.src ?? '');
  }, [current.src]);

  // Workspace-Sprachen laden (Content-Sprachen + mainLanguage)
  useEffect(() => {
    if (!inferredWorkspaceId) {
      setAvailableLanguages(DEFAULT_LANGUAGES);
      setActiveLang((prev) =>
        DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
      );
      return;
    }

    let cancelled = false;

    const loadLanguages = async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${inferredWorkspaceId}/languages`
        );

        if (!res.ok) {
          console.error(
            'get-content-management-languages error',
            res.status,
            await res.text().catch(() => '')
          );
          if (!cancelled) {
            setAvailableLanguages(DEFAULT_LANGUAGES);
            setActiveLang((prev) =>
              DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
            );
          }
          return;
        }

        const data = (await res.json()) as {
          workspaceId: string;
          languages: string[];
          mainLanguage?: string;
        };

        const raw = Array.isArray(data.languages) ? data.languages : [];
        const filtered = raw.filter((code): code is LanguageCode =>
          ALL_LANGUAGES.map((l) => l.code).includes(code as LanguageCode)
        );
        const unique = Array.from(new Set(filtered));
        const final = unique.length ? unique : DEFAULT_LANGUAGES;

        if (!cancelled) {
          setAvailableLanguages(final);

          const mainLang =
            (data.mainLanguage as LanguageCode | undefined) ?? final[0];

          setActiveLang((prev) => (final.includes(prev) ? prev : mainLang));
        }
      } catch (err) {
        console.error('Fehler beim Laden der Content-Sprachen:', err);
        if (!cancelled) {
          setAvailableLanguages(DEFAULT_LANGUAGES);
          setActiveLang((prev) =>
            DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
          );
        }
      }
    };

    void loadLanguages();

    return () => {
      cancelled = true;
    };
  }, [inferredWorkspaceId]);

  const updateField = <K extends keyof ImageValue>(
    key: K,
    val: ImageValue[K]
  ) => {
    onChange({ ...current, [key]: val });
  };

  const updateLocalizedField = (
    key: 'alt' | 'caption' | 'copyright',
    lang: LanguageCode,
    value: string
  ) => {
    const nextLocalized = setLocalized(
      current[key] as LocalizedText | undefined,
      lang,
      value
    );
    onChange({
      ...current,
      [key]: nextLocalized,
    });
  };

  const hasAnyUserMeta = (): boolean => {
    const maps: (LocalizedText | undefined)[] = [
      current.alt,
      current.caption,
      current.copyright,
    ];
    return maps.some(
      (m) => m && Object.values(m).some((v) => v && v.trim() !== '')
    );
  };

  const hasLangMeta = (lang: LanguageCode): boolean => {
    const alt = current.alt?.[lang];
    const caption = current.caption?.[lang];
    const copyright = current.copyright?.[lang];

    return !!(
      (alt && alt.trim() !== '') ||
      (caption && caption.trim() !== '') ||
      (copyright && copyright.trim() !== '')
    );
  };

  // ---------- Upload über MediaUploadArea (ein Bild) + KI-Meta ----------

  const handleUploadComplete = async (uploaded: MediaUploadResource[]) => {
    if (!uploaded.length) return;
    const resource = uploaded[0] as CloudinaryResource;

    const src = resource.secure_url || resource.url;
    if (!src) return;

    const mediaMeta = getMetaFromResource(resource);

    let next: ImageValue = {
      ...current,
      src,
      width: resource.width ?? current.width,
      height: resource.height ?? current.height,
    };

    const hasUserMeta = hasAnyUserMeta();

    // draftSrc mitziehen, damit Input die neue URL zeigt
    setDraftSrc(src);

    // KI-Meta holen
    let suggested: SuggestedMeta | undefined;

    try {
      const res = await fetch('/api/media/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicIds: [resource.public_id],
          languages: availableLanguages.length
            ? availableLanguages
            : DEFAULT_LANGUAGES,
        }),
      });

      if (res.ok) {
        const list = (await res.json()) as SuggestedMeta[];
        suggested = list[0];
      } else {
        console.error('generate-meta error', await res.text());
      }
    } catch (err) {
      console.error('Fehler bei generate-meta:', err);
    }

    // Soll Meta überschrieben / ergänzt werden?
    let overwriteMeta = true;
    if (hasUserMeta && typeof window !== 'undefined') {
      overwriteMeta = window.confirm(
        'Es sind bereits Metadaten (Alt-Text, Copyright, Bildunterschrift) vorhanden.\n' +
          'Möchtest du sie durch die Werte aus dem Upload (inkl. KI) ersetzen/ergänzen?'
      );
    }

    if (overwriteMeta) {
      const suggestedAlt = suggested?.alt ?? {};
      const suggestedCaption = suggested?.caption ?? {};
      const suggestedCopyright = suggested?.copyright ?? {};

      next = {
        ...next,
        alt: mergeLocalized(current.alt, mediaMeta.alt, suggestedAlt),
        caption: mergeLocalized(
          current.caption,
          mediaMeta.caption,
          Object.keys(suggestedCaption).length
            ? suggestedCaption
            : (suggested?.title ?? {})
        ),
        copyright: mergeLocalized(
          current.copyright,
          mediaMeta.copyright,
          suggestedCopyright
        ),
      };
    }

    onChange(next);
  };

  // ---------- Medienpool-Modal ----------

  const openMediaModal = async () => {
    setIsMediaModalOpen(true);
    setIsLoadingMedia(true);
    setMediaError(null);

    try {
      if (!inferredWorkspaceId) {
        throw new Error('Workspace ID missing');
      }
      const res = await fetch(`/api/workspaces/${inferredWorkspaceId}/media`);
      if (!res.ok) {
        throw new Error('Media list request failed');
      }

      const data = (await res.json()) as CloudinaryListResponse;
      setMediaItems(data.resources ?? []);
    } catch (err) {
      console.error('Media list error:', err);
      setMediaError('Medien konnten nicht geladen werden.');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const closeMediaModal = () => {
    setIsMediaModalOpen(false);
  };

  const applyResourceToValue = (resource: CloudinaryResource) => {
    const src = resource.secure_url || resource.url;
    if (!src) return;

    const mediaMeta = getMetaFromResource(resource);

    const hasUserMeta = hasAnyUserMeta();

    let overwriteMeta = true;

    if (hasUserMeta && typeof window !== 'undefined') {
      overwriteMeta = window.confirm(
        'Es sind bereits Metadaten (Alt-Text, Copyright, Bildunterschrift) vorhanden.\n' +
          'Möchtest du sie durch die Werte aus dem Medienpool ersetzen/ergänzen?'
      );
    }

    let next: ImageValue = {
      ...current,
      src,
      width: resource.width ?? current.width,
      height: resource.height ?? current.height,
    };

    // draftSrc mitziehen
    setDraftSrc(src);

    if (overwriteMeta) {
      next = {
        ...next,
        alt: mergeLocalized(current.alt, mediaMeta.alt),
        caption: mergeLocalized(current.caption, mediaMeta.caption),
        copyright: mergeLocalized(current.copyright, mediaMeta.copyright),
      };
    }

    onChange(next);
    closeMediaModal();
  };

  const handleSelectMedia = (resource: CloudinaryResource) => {
    applyResourceToValue(resource);
  };

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    closeMediaModal();
  };

  const hasAnyMeta = hasAnyUserMeta();

  const tabs: TabItem[] = availableLanguages.map((lang) => ({
    key: lang,
    label: lang.toUpperCase(),
    warning: hasAnyMeta && !hasLangMeta(lang),
  }));

  return (
    <BlockWrapper>
      {label && <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Sprach-Tabs */}
        <LanguageTabs
          tabs={tabs}
          activeKey={activeLang}
          onChange={(key) => setActiveLang(key as LanguageCode)}
          label="Sprachen"
          sourceLanguageCode={availableLanguages[0]}
          targetLanguageCode={activeLang}
        />

        {/* Gemeinsame Upload-Komponente (ein Bild) */}
        <MediaUploadArea
          multiple={false}
          onUploadComplete={handleUploadComplete}
          workspaceId={inferredWorkspaceId} // Pass workspaceId
        />

        {/* Aktuelle Quelle + Vorschau */}
        {draftSrc && (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: '#333',
            }}
          >
            <div
              style={{
                marginBottom: 4,
                wordBreak: 'break-all',
              }}
            >
              Aktuelle Quelle: <code>{draftSrc}</code>
            </div>
            <div
              style={{
                border: '1px solid #eee',
                borderRadius: 4,
                padding: 4,
                backgroundColor: '#fff',
                maxHeight: 180,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Für die kleine Vorschau ist ein "krummer" src-Wert okay,
                  <img> kommt damit klar, new URL wird hier nirgendwo aufgerufen */}
              <img
                src={draftSrc}
                alt={getLocalized(current.alt, activeLang)}
                style={{
                  maxWidth: '100%',
                  maxHeight: 160,
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>
        )}

        {/* Button Medienpool öffnen */}
        <button
          type="button"
          onClick={() => void openMediaModal()}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            backgroundColor: '#f5f5f5',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            alignSelf: 'flex-start',
            marginTop: 4,
          }}
        >
          Aus Medienpool auswählen
        </button>

        {/* klassische Inputs */}
        <input
          type="text"
          placeholder="Bild-URL (src)"
          value={draftSrc}
          onChange={(e) => {
            const next = e.target.value;
            setDraftSrc(next);

            // Nur wenn die URL syntaktisch okay ist, schieben wir sie in die Datenstruktur.
            if (isValidUrl(next)) {
              updateField('src', next);
            }
          }}
        />

        <input
          type="text"
          placeholder={`Alt-Text (${activeLang.toUpperCase()})`}
          value={getLocalized(current.alt, activeLang)}
          onChange={(e) =>
            updateLocalizedField('alt', activeLang, e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Breite (px)"
          value={current.width ?? ''}
          onChange={(e) =>
            updateField('width', e.target.valueAsNumber || undefined)
          }
        />

        <input
          type="number"
          placeholder="Höhe (px)"
          value={current.height ?? ''}
          onChange={(e) =>
            updateField('height', e.target.valueAsNumber || undefined)
          }
        />

        <input
          type="text"
          placeholder={`Copyright (${activeLang.toUpperCase()})`}
          value={getLocalized(current.copyright, activeLang)}
          onChange={(e) =>
            updateLocalizedField('copyright', activeLang, e.target.value)
          }
        />

        <input
          type="text"
          placeholder={`Bildunterschrift (${activeLang.toUpperCase()})`}
          value={getLocalized(current.caption, activeLang)}
          onChange={(e) =>
            updateLocalizedField('caption', activeLang, e.target.value)
          }
        />

        <input
          type="text"
          placeholder="CSS-Klasse"
          value={current.className ?? ''}
          onChange={(e) => updateField('className', e.target.value)}
        />
      </div>

      {/* Medienpool-Modal */}
      {isMediaModalOpen && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              maxWidth: '900px',
              width: '90%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
              boxShadow:
                '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>Bild aus Medienpool wählen</div>
              <button
                type="button"
                onClick={closeMediaModal}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {isLoadingMedia && (
              <div style={{ fontSize: 14, padding: 8 }}>Lade Medien …</div>
            )}

            {mediaError && !isLoadingMedia && (
              <div
                style={{
                  fontSize: 14,
                  padding: 8,
                  color: '#b00020',
                }}
              >
                {mediaError}
              </div>
            )}

            {!isLoadingMedia && !mediaError && (
              <div
                style={{
                  overflowY: 'auto',
                  borderTop: '1px solid #eee',
                  paddingTop: 12,
                }}
              >
                {mediaItems.length === 0 ? (
                  <div style={{ fontSize: 14, padding: 8 }}>
                    Keine Medien im Pool gefunden.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {mediaItems.map((item) => {
                      const src = item.secure_url || item.url;
                      if (!src) return null;

                      return (
                        <button
                          key={item.public_id}
                          type="button"
                          onClick={() => handleSelectMedia(item)}
                          style={{
                            border: '1px solid #eee',
                            borderRadius: 6,
                            padding: 4,
                            backgroundColor: '#fafafa',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={src}
                            alt={item.public_id}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              textAlign: 'center',
                              wordBreak: 'break-all',
                            }}
                          >
                            {item.public_id.replace(/^mediapool\//, '')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </BlockWrapper>
  );
};

export default ImageInputBlock;
