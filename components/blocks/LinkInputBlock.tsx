// components/blocks/LinkInputBlock.tsx
'use client';

import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { usePathname } from 'next/navigation';
import { BlockWrapper } from './BlockWrapper.styles';
import { TextInput } from '@/components/content-elements/default';
import SwitchInput from '@/components/content-elements/default/inputs/switch-input';

import LanguageTabs, {
  TabItem,
} from '@/components/workspace-language-tabs/LanguageTabs';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '@/components/language-settings/languages';
import { TranslateTarget } from '@/components/ai-translate/AiTranslate';

/* =======================
   NEW only field type
======================= */

type LocalizedHtml = Record<string, string>;
type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSingleLineElement(v: unknown): v is SingleLineElement {
  return (
    v === 'div' ||
    v === 'h1' ||
    v === 'h2' ||
    v === 'h3' ||
    v === 'h4' ||
    v === 'h5' ||
    v === 'h6'
  );
}

function isLocalizedHtml(v: unknown): v is LocalizedHtml {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

function isLocalizedFieldValue(v: unknown): v is LocalizedFieldValue {
  if (!isRecord(v)) return false;
  const value = (v as { value?: unknown }).value;
  const element = (v as { element?: unknown }).element;
  if (!isLocalizedHtml(value)) return false;
  if (!isSingleLineElement(element)) return false;
  return true;
}

function getLocalizedForEdit(map: LocalizedHtml, lang: LanguageCode): string {
  // ✅ kein Fallback im Editor
  return map[lang] ?? '';
}

function getLocalizedForView(map: LocalizedHtml, lang: LanguageCode): string {
  // ✅ Fallback nur fürs „Anzeigen“
  return map[lang] ?? map.de ?? '';
}

/**
 * ✅ Fix: nicht immer trimmen.
 * - trim=false  => erlaubt trailing spaces (z.B. im Label)
 * - trim=true   => z.B. für URLs okay
 * - deleteIfEmpty=true => löscht nur, wenn der Wert wirklich "" ist
 *   (nicht wenn er nur aus Leerzeichen besteht – damit kannst du am Ende Spaces setzen)
 */
function setLocalized(
  map: LocalizedHtml,
  lang: LanguageCode,
  text: string,
  opts?: { trim?: boolean; deleteIfEmpty?: boolean }
): LocalizedHtml {
  const next: LocalizedHtml = { ...map };
  const raw = text ?? '';

  const shouldTrim = opts?.trim ?? false;
  const deleteIfEmpty = opts?.deleteIfEmpty ?? true;

  const value = shouldTrim ? raw.trim() : raw;

  if (deleteIfEmpty && value === '') {
    delete next[lang];
    return next;
  }

  next[lang] = value;
  return next;
}

/* =======================
   Link types (NEW)
======================= */

export type LinkValue = {
  id?: string;

  // ✅ NEW only: localized plain text (kein RTE)
  label: LocalizedFieldValue; // Link-Text
  href: LocalizedFieldValue; // Link-URL (intern/extern)

  newTab: boolean;
  highlighted?: boolean;
};

export type UrlSuggestion = {
  id?: string;
  label: string;
  href: string;
  subtitle?: string;
};

type LinkInputBlockProps = {
  label: string;
  value: LinkValue | null | undefined;
  onChange: (next: LinkValue) => void;

  fetchUrlSuggestions?: (query: string) => Promise<UrlSuggestion[]>;
  debounceMs?: number;
  fillLabelWhenEmpty?: boolean;
};

/* =======================
   URL helpers
======================= */

function isValidHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    if (input.startsWith('/')) return true;
    return false;
  }
}

function normalize(s?: string) {
  return (s ?? '').toLowerCase().trim();
}

function scoreMatch(q: string, s?: string): number {
  const hay = normalize(s);
  if (!q || !hay) return -1;
  const i = hay.indexOf(q);
  if (i < 0) return -1;
  let score = 100 - i;
  if (i === 0) score += 100;
  if (hay === q) score += 50;
  return score;
}

function filterAndRankSuggestions(
  qRaw: string,
  results: UrlSuggestion[],
  limit = 20
) {
  const q = normalize(qRaw);
  if (!q) return [];
  return results
    .map((r) => ({
      r,
      score: Math.max(scoreMatch(q, r.label), scoreMatch(q, r.href)),
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}

/* =======================
   Component
======================= */

const LinkInputBlock: FC<LinkInputBlockProps> = ({
  label,
  value,
  onChange,
  fetchUrlSuggestions,
  debounceMs = 200,
  fillLabelWhenEmpty = true,
}) => {
  const pathname = usePathname();

  const inferredWorkspaceId = useMemo(() => {
    const match = pathname?.match(/\/workspaces\/([^/]+)/);
    return match?.[1] ? match[1] : undefined;
  }, [pathname]);

  // Workspace languages
  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageCode[]>(DEFAULT_LANGUAGES);
  const [mainLang, setMainLang] = useState<LanguageCode>(DEFAULT_LANGUAGES[0]);
  const [activeLang, setActiveLang] = useState<LanguageCode>(
    DEFAULT_LANGUAGES[0]
  );

  // LanguageTabs erwartet loading + handler
  const [isTranslating] = useState(false);

  useEffect(() => {
    if (!inferredWorkspaceId) {
      setAvailableLanguages(DEFAULT_LANGUAGES);
      setMainLang(DEFAULT_LANGUAGES[0]);
      setActiveLang((prev) =>
        DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
      );
      return;
    }

    let isCancelled = false;

    const loadLanguages = async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${inferredWorkspaceId}/languages`
        );

        if (!res.ok) {
          if (!isCancelled) {
            setAvailableLanguages(DEFAULT_LANGUAGES);
            setMainLang(DEFAULT_LANGUAGES[0]);
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

        const rawLanguages = Array.isArray(data.languages)
          ? data.languages
          : [];
        const allCodes = ALL_LANGUAGES.map((l) => l.code);

        const filtered = rawLanguages.filter((code): code is LanguageCode =>
          allCodes.includes(code as LanguageCode)
        );

        const unique = Array.from(new Set(filtered));
        const finalLanguages = unique.length > 0 ? unique : DEFAULT_LANGUAGES;

        if (!isCancelled) {
          setAvailableLanguages(finalLanguages);

          const mainLanguageFromData = data.mainLanguage as
            | LanguageCode
            | undefined;
          const resolvedMainLang =
            mainLanguageFromData &&
            finalLanguages.includes(mainLanguageFromData)
              ? mainLanguageFromData
              : finalLanguages[0];

          setMainLang(resolvedMainLang);
          setActiveLang((prev) =>
            finalLanguages.includes(prev) ? prev : resolvedMainLang
          );
        }
      } catch {
        if (!isCancelled) {
          setAvailableLanguages(DEFAULT_LANGUAGES);
          setMainLang(DEFAULT_LANGUAGES[0]);
          setActiveLang((prev) =>
            DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
          );
        }
      }
    };

    void loadLanguages();

    return () => {
      isCancelled = true;
    };
  }, [inferredWorkspaceId]);

  // Controlled defaults (NEW only)
  const safe = useMemo<LinkValue>(() => {
    const v = value ?? ({} as LinkValue);
    const emptyField: LocalizedFieldValue = { value: {}, element: 'div' };

    const labelField = isLocalizedFieldValue(v.label) ? v.label : emptyField;
    const hrefField = isLocalizedFieldValue(v.href) ? v.href : emptyField;

    return {
      id: v.id,
      label: labelField,
      href: hrefField,
      newTab: !!v.newTab,
      highlighted: !!v.highlighted,
    };
  }, [value]);

  const patch = (partial: Partial<LinkValue>) => {
    onChange({ ...safe, ...partial });
  };

  // Current localized strings for inputs
  const hrefText = getLocalizedForEdit(safe.href.value, activeLang);
  const labelText = getLocalizedForEdit(safe.label.value, activeLang);

  // ✅ URL: hier darfst du trimmen (optional)
  const setHrefText = (next: string) => {
    patch({
      href: {
        ...safe.href,
        value: setLocalized(safe.href.value, activeLang, next, { trim: true }),
      },
    });
  };

  // ✅ Label: KEIN trim -> erlaubt Leerzeichen am Ende
  const setLabelText = (next: string) => {
    patch({
      label: {
        ...safe.label,
        value: setLocalized(safe.label.value, activeLang, next, {
          trim: false,
        }),
      },
    });
  };

  const hasUrl = hrefText.trim().length > 0;
  const isUrlValid = !hasUrl || isValidHttpUrl(hrefText);

  // ---------- Suggestions (per-language query) ----------
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>(hrefText ?? '');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UrlSuggestion[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Query spiegeln, wenn Sprache oder href geändert wurde
  useEffect(() => {
    setQuery(hrefText ?? '');
    setItems([]);
    setOpen(false);
    setHighlightIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang, hrefText]);

  // Debounced Suche
  useEffect(() => {
    if (!fetchUrlSuggestions) return;
    if (!query || query.trim() === '') {
      setItems([]);
      setOpen(false);
      setHighlightIndex(-1);
      return;
    }

    let alive = true;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const raw = (await fetchUrlSuggestions(query)) ?? [];
        if (!alive) return;

        const filtered = filterAndRankSuggestions(query, raw);

        const qn = normalize(query);
        const exactIndex = filtered.findIndex(
          (s) => normalize(s.href) === qn || normalize(s.label) === qn
        );

        setItems(filtered);
        if (exactIndex >= 0) {
          setOpen(false);
          setHighlightIndex(exactIndex);
        } else {
          setOpen(filtered.length > 0);
          setHighlightIndex(filtered.length > 0 ? 0 : -1);
        }
      } catch {
        if (!alive) return;
        setItems([]);
        setOpen(false);
        setHighlightIndex(-1);
      } finally {
        if (alive) setLoading(false);
      }
    }, debounceMs);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, fetchUrlSuggestions, debounceMs]);

  // Outside Click → schließen
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const applySuggestion = useCallback(
    (s: UrlSuggestion) => {
      const nextHrefValue = setLocalized(safe.href.value, activeLang, s.href, {
        trim: true,
      });

      // label optional setzen (wenn leer in aktiver Sprache)
      const currentLabel = getLocalizedForEdit(
        safe.label.value,
        activeLang
      ).trim();
      const shouldFill = fillLabelWhenEmpty && !currentLabel;

      const nextLabelValue = shouldFill
        ? setLocalized(safe.label.value, activeLang, s.label, { trim: false })
        : safe.label.value;

      const next: LinkValue = {
        ...safe,
        href: { ...safe.href, value: nextHrefValue },
        label: { ...safe.label, value: nextLabelValue },
      };

      onChange(next);
      setQuery(s.href);
      setOpen(false);
    },
    [safe, onChange, fillLabelWhenEmpty, activeLang]
  );

  const onHrefKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!open || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev + 1;
        return next >= items.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? items.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < items.length) {
        e.preventDefault();
        applySuggestion(items[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const hasAnyLabel = Object.values(safe.label.value).some(
    (v) => v && v.trim()
  );
  const hasAnyHref = Object.values(safe.href.value).some((v) => v && v.trim());

  const tabs: TabItem[] = availableLanguages.map((lang) => {
    const ownLabel = safe.label.value[lang];
    const ownHref = safe.href.value[lang];

    const hasOwn = !!(
      (ownLabel && ownLabel.trim()) ||
      (ownHref && ownHref.trim())
    );

    const hasAny = hasAnyLabel || hasAnyHref;

    return {
      key: lang,
      label: lang.toUpperCase(),
      warning: hasAny && !hasOwn,
      hasPendingSuggestion: false,
    };
  });

  const handleTranslateClick = async (
    _source: LanguageCode,
    _target: TranslateTarget
  ) => {
    // explizit: kein RTE / keine Übersetzung hier
    return;
  };

  return (
    <BlockWrapper ref={wrapperRef}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>

      <LanguageTabs
        tabs={tabs}
        activeKey={activeLang}
        onChange={(key) => setActiveLang(key as LanguageCode)}
        label="Sprachen"
        sourceLanguageCode={mainLang}
        targetLanguageCode={activeLang}
        mainLanguageCode={mainLang}
        onTranslateClick={handleTranslateClick}
        loading={isTranslating}
      />

      <div style={{ display: 'grid', gap: '0.75rem', marginTop: 8 }}>
        {/* URL + Warn-Icon + Suggest-Dropdown */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <TextInput
                label="Link-URL"
                value={query}
                onChange={(val) => {
                  setQuery(val);
                  setHrefText(val);
                  if (fetchUrlSuggestions && val.trim()) setOpen(true);
                }}
                onKeyDown={onHrefKeyDown}
              />
            </div>

            {query.trim().length > 0 && !isUrlValid && (
              <div
                role="img"
                aria-label="Ungültige URL"
                title="Ungültige URL (erwartet http(s)://… oder interner Pfad /...)"
                style={{
                  width: 20,
                  height: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            )}
          </div>

          {open && (items.length > 0 || loading) && (
            <div
              style={{
                position: 'absolute',
                zIndex: 50,
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow:
                  '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              {loading && (
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: 14,
                    color: '#6b7280',
                  }}
                >
                  Suchen …
                </div>
              )}

              {!loading &&
                items.map((s, idx) => (
                  <button
                    key={s.id ?? s.href ?? `${s.label}-${idx}`}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    style={{
                      display: 'block',
                      textAlign: 'left',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: idx === highlightIndex ? '#f3f4f6' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {s.subtitle ?? s.href}
                    </div>
                  </button>
                ))}

              {!loading && items.length === 0 && (
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: 14,
                    color: '#6b7280',
                  }}
                >
                  Keine Ergebnisse
                </div>
              )}
            </div>
          )}
        </div>

        {/* Link text (localized plain text) */}
        <TextInput
          label="Link-Text"
          value={labelText}
          onChange={(val) => setLabelText(val)}
        />

        <div>
          <SwitchInput
            label="In neuem Tab öffnen"
            checked={safe.newTab}
            disabled={!hasUrl}
            onChange={(checked) => patch({ newTab: checked })}
          />
        </div>

        <div>
          <SwitchInput
            label="Hervorgehoben"
            checked={!!safe.highlighted}
            onChange={(checked) => patch({ highlighted: checked })}
          />
        </div>
      </div>
    </BlockWrapper>
  );
};

export default LinkInputBlock;
