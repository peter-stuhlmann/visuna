// components/seo-settings/SeoSettingsSummary.tsx
'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';
import {
  Actions,
  HeaderRow,
  SaveButton,
  Title,
} from './SeoSettingsSummary.styles';
import TextInputBlock from '../blocks/TextInputBlock';

type SeoSettingsSummaryProps = {
  pageId: string;
  pageUrl: string;
  initialSeo?: Partial<SeoData>;
  workspaceId?: string;
  onSaved?: (seo: SeoData) => void;
  languages: LanguageCode[];
  mainLanguage?: LanguageCode;
};

type LocalizedString = Record<string, string>;

export type SeoData = {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;

  ogTitle: LocalizedString;
  ogDescription: LocalizedString;
  ogImage: LocalizedString;
  ogImageAlt: LocalizedString;

  twitterCard: LocalizedString;
  twitterTitle: LocalizedString;
  twitterDescription: LocalizedString;
  twitterImage: LocalizedString;
  twitterImageAlt: LocalizedString;

  canonicalUrl: LocalizedString;
  robots: LocalizedString;

  ogUrl: LocalizedString;
  ogType: LocalizedString;
  ogSiteName: LocalizedString;
};

const emptySeo = (): SeoData => ({
  metaTitle: {},
  metaDescription: {},

  ogTitle: {},
  ogDescription: {},
  ogImage: {},
  ogImageAlt: {},

  twitterCard: {},
  twitterTitle: {},
  twitterDescription: {},
  twitterImage: {},
  twitterImageAlt: {},

  canonicalUrl: {},
  robots: {},

  ogUrl: {},
  ogType: {},
  ogSiteName: {},
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceLocalizedString(v: unknown): LocalizedString {
  if (!isRecord(v)) return {};
  const out: LocalizedString = {};
  for (const [k, val] of Object.entries(v)) {
    // ✅ NICHT trimmen (sonst "Leerzeichen tippen" Problem / UX)
    if (typeof val === 'string' && val.length) out[k] = val;
  }
  return out;
}

function coerceSeo(input: unknown): SeoData {
  const base = emptySeo();
  if (!isRecord(input)) return base;

  const get = (key: keyof SeoData) =>
    coerceLocalizedString((input as Record<string, unknown>)[key as string]);

  return {
    metaTitle: get('metaTitle'),
    metaDescription: get('metaDescription'),

    ogTitle: get('ogTitle'),
    ogDescription: get('ogDescription'),
    ogImage: get('ogImage'),
    ogImageAlt: get('ogImageAlt'),

    twitterCard: get('twitterCard'),
    twitterTitle: get('twitterTitle'),
    twitterDescription: get('twitterDescription'),
    twitterImage: get('twitterImage'),
    twitterImageAlt: get('twitterImageAlt'),

    canonicalUrl: get('canonicalUrl'),
    robots: get('robots'),

    ogUrl: get('ogUrl'),
    ogType: get('ogType'),
    ogSiteName: get('ogSiteName'),
  };
}

type SaveSeoResponse = {
  message?: string;
  page?: unknown; // wir coerce’n daraus seo
};

export async function savePageSeo(params: {
  pageId: string;
  workspaceId?: string;
  seo: SeoData;
}): Promise<SeoData | null> {
  const res = await fetch(
    `/api/workspaces/${params.workspaceId}/pages/${params.pageId}/seo`,
    {
      method: 'PATCH', // <-- HIER
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seo: params.seo,
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('savePageSeo failed:', res.status, txt);
    return null;
  }

  const data = (await res.json()) as SaveSeoResponse;

  if (data && isRecord(data.page) && 'seo' in data.page) {
    return coerceSeo((data.page as Record<string, unknown>).seo);
  }

  return null;
}

type GetSeoResponse = {
  message?: string;
  seo?: unknown;
};

async function fetchPageSeo(
  pageId: string,
  workspaceId: string
): Promise<SeoData | null> {
  const res = await fetch(
    `/api/workspaces/${workspaceId}/pages/${pageId}/seo`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('fetchPageSeo failed:', res.status, txt);
    return null;
  }

  const data = (await res.json()) as GetSeoResponse;
  return coerceSeo(data?.seo ?? {});
}

const SeoSettingsSummary: FC<SeoSettingsSummaryProps> = ({
  pageId,
  pageUrl,
  initialSeo,
  workspaceId,
  onSaved,
  languages,
  mainLanguage,
}) => {
  // ---------------------------
  // Languages: kommen nur noch über Props
  // ---------------------------
  const allowedCodes = useMemo(
    () => new Set(ALL_LANGUAGES.map((l) => l.code as LanguageCode)),
    []
  );

  const availableLanguages = useMemo<LanguageCode[]>(() => {
    const input = Array.isArray(languages) ? languages : [];
    const filtered = input.filter((c): c is LanguageCode =>
      allowedCodes.has(c as LanguageCode)
    );
    const unique = Array.from(new Set(filtered));
    return unique.length ? unique : [...DEFAULT_LANGUAGES];
  }, [languages, allowedCodes]);

  const resolvedMainLang = useMemo<LanguageCode>(() => {
    if (mainLanguage && availableLanguages.includes(mainLanguage)) {
      return mainLanguage;
    }
    return availableLanguages[0] ?? DEFAULT_LANGUAGES[0];
  }, [mainLanguage, availableLanguages]);

  // ---------------------------
  // SEO State (initial + optional fetch)
  // ---------------------------
  const initial = useMemo(() => coerceSeo(initialSeo ?? {}), [initialSeo]);
  const [seo, setSeo] = useState<SeoData>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isLoadingSeo, setIsLoadingSeo] = useState(false);

  // initialSeo von außen (SSR etc.)
  useEffect(() => {
    setSeo(initial);
    setDirty(false);
  }, [initial]);

  // ✅ Wenn initialSeo leer ist, SEO vom Server nachladen
  useEffect(() => {
    let cancelled = false;

    const hasInitialSeo = Object.values(initial).some(
      (m) => m && typeof m === 'object' && Object.keys(m).length > 0
    );

    if (hasInitialSeo) return;

    const load = async () => {
      setIsLoadingSeo(true);
      try {
        const loaded = await fetchPageSeo(pageId, workspaceId ?? '');
        if (cancelled) return;

        if (loaded) {
          setSeo(loaded);
          setDirty(false);
        }
      } finally {
        if (!cancelled) setIsLoadingSeo(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [pageId, initial]);

  // ✅ onChange mehrsprachig: kompletter Map kommt zurück
  const setField = <K extends keyof SeoData>(key: K, next: LocalizedString) => {
    setSeo((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const savedSeo = await savePageSeo({ pageId, seo });

      if (savedSeo) {
        setSeo(savedSeo);
        onSaved?.(savedSeo);
      } else {
        onSaved?.(seo);
      }

      setDirty(false);
      setLastSavedAt(Date.now());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <HeaderRow>
        <Actions>
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={isSaving || !dirty}
            $dirty={dirty}
            title={dirty ? 'Änderungen speichern' : 'Keine Änderungen'}
          >
            {isSaving ? 'Speichere…' : 'Speichern'}
          </SaveButton>
        </Actions>
      </HeaderRow>

      {isLoadingSeo && (
        <div style={{ fontSize: 12, color: '#6b7280', padding: '6px 0' }}>
          SEO wird geladen…
        </div>
      )}
      <div style={{ marginTop: 10, opacity: isLoadingSeo ? 0.4 : 1, pointerEvents: isLoadingSeo ? 'none' : 'auto', transition: 'opacity 0.2s ease' }}>
          {/* Standard SEO */}
          <TextInputBlock
            label="Meta-Titel"
            value={seo.metaTitle}
            onChange={(v) => setField('metaTitle', v as LocalizedString)}
            multiLanguage
            translateFieldKey="metaTitle"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Meta-Beschreibung"
            rows={3}
            value={seo.metaDescription}
            onChange={(v) => setField('metaDescription', v as LocalizedString)}
            multiLanguage
            translateFieldKey="metaDescription"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />

          {/* Open Graph */}
          <TextInputBlock
            label="OG Titel (og:title)"
            value={seo.ogTitle}
            onChange={(v) => setField('ogTitle', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogTitle"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="OG Beschreibung (og:description)"
            rows={3}
            value={seo.ogDescription}
            onChange={(v) => setField('ogDescription', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogDescription"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="OG Bild-URL (og:image)"
            value={seo.ogImage}
            onChange={(v) => setField('ogImage', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogImage"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="OG Bild Alt-Text (og:image:alt)"
            value={seo.ogImageAlt}
            onChange={(v) => setField('ogImageAlt', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogImageAlt"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />

          {/* Twitter / X */}
          <TextInputBlock
            label="Twitter Card Type (twitter:card)"
            value={seo.twitterCard}
            onChange={(v) => setField('twitterCard', v as LocalizedString)}
            multiLanguage
            translateFieldKey="twitterCard"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Twitter Titel (twitter:title)"
            value={seo.twitterTitle}
            onChange={(v) => setField('twitterTitle', v as LocalizedString)}
            multiLanguage
            translateFieldKey="twitterTitle"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Twitter Beschreibung (twitter:description)"
            rows={3}
            value={seo.twitterDescription}
            onChange={(v) =>
              setField('twitterDescription', v as LocalizedString)
            }
            multiLanguage
            translateFieldKey="twitterDescription"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Twitter Bild-URL (twitter:image)"
            value={seo.twitterImage}
            onChange={(v) => setField('twitterImage', v as LocalizedString)}
            multiLanguage
            translateFieldKey="twitterImage"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Twitter Bild Alt-Text (twitter:image:alt)"
            value={seo.twitterImageAlt}
            onChange={(v) => setField('twitterImageAlt', v as LocalizedString)}
            multiLanguage
            translateFieldKey="twitterImageAlt"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />

          {/* Canonical / Robots */}
          <TextInputBlock
            label="Canonical URL (link rel=canonical)"
            value={seo.canonicalUrl}
            onChange={(v) => setField('canonicalUrl', v as LocalizedString)}
            multiLanguage
            translateFieldKey="canonicalUrl"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="Robots (meta robots)"
            value={seo.robots}
            onChange={(v) => setField('robots', v as LocalizedString)}
            multiLanguage
            translateFieldKey="robots"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />

          {/* Sharing-Details */}
          <TextInputBlock
            label="OG URL (og:url)"
            value={seo.ogUrl}
            onChange={(v) => setField('ogUrl', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogUrl"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="OG Type (og:type)"
            value={seo.ogType}
            onChange={(v) => setField('ogType', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogType"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
          <TextInputBlock
            label="OG Site Name (og:site_name)"
            value={seo.ogSiteName}
            onChange={(v) => setField('ogSiteName', v as LocalizedString)}
            multiLanguage
            translateFieldKey="ogSiteName"
            enableAiTranslate
            languagesOverride={availableLanguages}
            mainLanguageOverride={resolvedMainLang}
            workspaceId={workspaceId}
          />
      </div>
    </>
  );
};

export default SeoSettingsSummary;
