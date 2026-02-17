'use client';

import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
  startTransition,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MdArrowUpward, MdArrowDownward, MdAdd, MdArrowBack, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { TbViewportShort } from 'react-icons/tb';

import { ContentElementSettingsWrapperContainer } from './ContentElementSettingsWrapper.styles';
import { Button, TextInput } from '../content-elements/default';
import SwitchInput from '../content-elements/default/inputs/switch-input';
import TabMenu from '../content-elements/default/tab-menu';
import { TabItem } from '../content-elements/default/tab-menu/component/TabMenu.types';

import {
  AllElementData,
  FieldKey,
  FieldTypeMap,
} from '../content-elements/default/types';

import { useStatus } from '../status/StatusContext';
import { usePageElements } from '../usePageElements';
import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';

import { renderField, type AnyFieldType } from '@/utils/renderFields';
import PageElementVisibilityStatus from '../page-elements-visibility-status/PageElementsVisibilityStatus';
import { useElementApi } from '@/components/ElementApiContext';

/* =========================================================================================
 * Settings-Typen (nur neue Struktur)
 * =======================================================================================*/

type Option = { label: string; value: string };

type FieldConfigBase = {
  title?: string;
  default?: unknown;
  placeholder?: string;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  config?: Record<string, unknown>;
  adminOnly?: boolean;
};

type FieldItem = FieldConfigBase & {
  /** Pfad in data, z. B. "cards" oder "icon.large.color" */
  key: FieldKey;
  /** Field-Typ z. B. "text", "animated-card[]", ... */
  field: AnyFieldType;
};

type FieldLeaf = string | FieldItem;

type SettingsSubGroup = {
  name: string;
  fields: Array<FieldLeaf | SettingsSubGroup>;
};

type SettingsTopGroup = {
  name: string;
  fields: Array<FieldLeaf | SettingsSubGroup>;
};

type ElementSettingsModule = {
  settings?: SettingsTopGroup[];
};

/* =========================================================================================
 * Type Guards
 * =======================================================================================*/
function isSettingsSubGroup(x: unknown): x is SettingsSubGroup {
  return (
    !!x &&
    typeof x === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'name' in (x as any) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'fields' in (x as any) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.isArray((x as any).fields)
  );
}

function isFieldItemObject(x: unknown): x is FieldItem {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!x && typeof x === 'object' && 'key' in (x as any) && 'field' in (x as any)
  );
}

/* =========================================================================================
 * Utils
 * =======================================================================================*/
function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 150
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saved = useRef(fn);

  useEffect(() => {
    saved.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => saved.current(...args), delay);
    },
    [delay]
  ) as T;

  return [debounced, cancel] as const;
}

const getAtPath = (obj: unknown, keys: string[]): unknown => {
  let acc: unknown = obj;
  for (const k of keys) {
    if (
      acc &&
      typeof acc === 'object' &&
      !Array.isArray(acc) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      k in (acc as any)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc = (acc as any)[k];
    } else {
      return undefined;
    }
  }
  return acc;
};

const setAtPath = (
  base: AllElementData,
  keys: string[],
  value: unknown
): AllElementData => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const next: any = Array.isArray(base) ? [...base] : { ...base };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = next;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (i === keys.length - 1) {
      cur[k] = value;
    } else {
      const v = cur[k];
      cur[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...v } : {};
      cur = cur[k];
    }
  }

  return next as AllElementData;
};

/* =========================================================================================
 * Defaults ausschließlich aus settings.ts extrahieren
 * =======================================================================================*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectDefaultsFromSettings(settings: SettingsTopGroup[]): any {
  const defaults: Record<string, unknown> = {};

  const assignDefault = (key: string, defVal: unknown) => {
    const ks = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = defaults;
    ks.forEach((k, i) => {
      if (i === ks.length - 1) cur[k] = defVal;
      else cur = cur[k] ?? (cur[k] = {});
    });
  };

  const walk = (node: FieldLeaf | SettingsSubGroup) => {
    if (typeof node === 'string') return;

    if (isSettingsSubGroup(node)) {
      node.fields.forEach(walk);
      return;
    }

    if (isFieldItemObject(node)) {
      if (node.default !== undefined) {
        assignDefault(String(node.key), node.default);
      }
    }
  };

  for (const top of settings ?? []) {
    top.fields.forEach(walk);
  }

  return defaults;
}

/** Fehlende Felder rekursiv aus Defaults auffüllen (ohne vorhandene Werte zu überschreiben) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepFillMissing(target: any, src: any): any {
  if (!src || typeof src !== 'object') return target;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = Array.isArray(target) ? [...target] : { ...target };

  for (const [k, v] of Object.entries(src)) {
    const cur = out[k];

    if (cur === undefined) {
      out[k] = Array.isArray(v)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [...(v as any)]
        : v && typeof v === 'object'
          ? deepFillMissing({}, v)
          : v;
      continue;
    }

    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      cur &&
      typeof cur === 'object' &&
      !Array.isArray(cur)
    ) {
      out[k] = deepFillMissing(cur, v);
    }
  }

  return out;
}

/* =========================================================================================
 * Settings dynamisch laden
 * =======================================================================================*/
const ELEMENT_BASE = '../content-elements/default';

async function loadElementSettings(
  elementKey: string
): Promise<SettingsTopGroup[]> {
  if (!elementKey) return [];

  const candidates = [
    `${ELEMENT_BASE}/${elementKey}/settings/index`,
    `${ELEMENT_BASE}/${elementKey}/settings/settings`,
    `${ELEMENT_BASE}/${elementKey}/settings`,
  ] as const;

  for (const p of candidates) {
    try {
      const mod = (await import(
        /* webpackMode: "lazy" */
        /* webpackInclude: /default\/.*\/settings(\/(settings|index))?\.(t|j)s$/ */
        p
      )) as ElementSettingsModule;

      if (Array.isArray(mod?.settings)) return mod.settings!;
    } catch {
      // try next
    }
  }

  return [];
}

/* =========================================================================================
 * Feld-Normalisierung (nur neue Struktur)
 * =======================================================================================*/
const KNOWN_TYPES: AnyFieldType[] = [
  'accordion-item',
  'rte-textarea',
  'rte-text',
  'rte-textarea[]',
  'rte-text[]',
  'element-layout',
  'text',
  'html',
  'link',
  'number',
  'color',
  'select',
  'date',
  'map',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'list-item',
  'image',
  'video',
  'audio',
  'fact-item',
  'accordion-item[]',
  'tabmenu-item',
  'tabmenu-item[]',
  'text[]',
  'html[]',
  'link[]',
  'number[]',
  'color[]',
  'select[]',
  'date[]',
  'map[]',
  'checkbox[]',
  'radio[]',
  'switch[]',
  'slider[]',
  'image[]',
  'video[]',
  'audio[]',
  'fact-item[]',
  'list-item[]',
  'counter-item',
  'counter-item[]',
  'animated-card',
  'animated-card[]',
] as unknown as AnyFieldType[];

function isKnownType(t: string): t is AnyFieldType {
  return KNOWN_TYPES.includes(t as AnyFieldType);
}

function normalizeFieldItem(node: FieldItem): {
  dataKey: string;
  type: AnyFieldType;
  cfg: FieldConfigBase;
} {
  const t =
    typeof node.field === 'string' && isKnownType(node.field)
      ? (node.field as AnyFieldType)
      : 'text';
  return { dataKey: String(node.key), type: t, cfg: node };
}

/* =========================================================================================
 * Komponente
 * =======================================================================================*/
export type ContentElementSettingsWrapperHandle = {
  save: () => Promise<boolean>;
  cancel: () => void;
};

type Props = {
  handleCloseModal: () => void;
  onCancel?: () => void;
  workspaceId: string;
  pageId: string;
  containerStyle?: React.CSSProperties;
};

const ContentElementSettingsWrapper = forwardRef<
  ContentElementSettingsWrapperHandle,
  Props
>(({ handleCloseModal, onCancel, workspaceId, pageId, containerStyle }, ref) => {
  const { addStatus } = useStatus();
  const { pageElements, editingPageElementId, updatePageElement } =
    usePageElements();
  const { selectedWorkspace } = useSelectedWorkspace();
  const api = useElementApi(workspaceId, pageId);

  const elementIndex = useMemo(
    () => pageElements.findIndex((el) => el._id === editingPageElementId),
    [pageElements, editingPageElementId]
  );

  const prevElement = elementIndex > 0 ? pageElements[elementIndex - 1] : undefined;
  const nextElement = elementIndex < pageElements.length - 1 ? pageElements[elementIndex + 1] : undefined;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleNav = (id: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set('editId', id);
      sp.delete('afterId');
      sp.set('mode', 'edit-element');
      startTransition(() => {
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      });
  };

  const handleCreate = (position: 'before' | 'after') => {
      const afterId = position === 'before' 
          ? (prevElement?._id ?? null) 
          : pageElementId;

      const sp = new URLSearchParams(searchParams.toString());
      sp.set('mode', 'create-element');
      sp.delete('editId');
      if (afterId) sp.set('afterId', afterId);
      else sp.delete('afterId');

      startTransition(() => {
          router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      });
  };

  const editedElement =
    elementIndex >= 0 ? pageElements[elementIndex] : undefined;

  const elementKey = String(editedElement?.element ?? '');
  const pageElementId = editedElement?._id ?? '';

  const isElementPrime = !!editedElement?.data?.prime;
  const isWorkspacePrime = selectedWorkspace?.plan === 'prime';
  const isDeletable = !isElementPrime || isWorkspacePrime;
  const isLocked = !isDeletable;

  const [settings, setSettings] = useState<SettingsTopGroup[]>([]);
  const [loadedKey, setLoadedKey] = useState<string>('');

  const [draft, setDraft] = useState<AllElementData>(
    (((editedElement?.data ?? {}) as AllElementData) || {}) as AllElementData
  );

  const originalDataRef = useRef<AllElementData | null>(null);
  const originalMergedRef = useRef<AllElementData | null>(null);

  const [metaName, setMetaName] = useState<string>(editedElement?.name ?? '');
  const [metaVisible, setMetaVisible] = useState<boolean>(
    !!editedElement?.visible
  );

  const originalMetaRef = useRef<{ name?: string; visible?: boolean } | null>(
    null
  );

  const appliedDefaultsRef = useRef<Set<string>>(new Set());

  /* ------------ Role Fetching ------------ */
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        // ProfileSettings uses: workspaceProfile.role
        const r = json?.workspaceProfile?.role;
        if (active && typeof r === 'string') {
          setUserRole(r);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /* ------------ Auto-Commit (debounced) ------------ */
  const commitFn = useCallback(
    (data: AllElementData) => {
      if (!pageElementId) return;
      startTransition(() => {
        updatePageElement(pageElementId, { data });
      });
    },
    [pageElementId, updatePageElement]
  );

  const [debouncedCommit, cancelDebounce] = useDebouncedCallback(commitFn, 120);

  const lastRef = useRef<AllElementData>(draft);

  useEffect(() => {
    if (lastRef.current === draft) return;
    debouncedCommit(draft);
    lastRef.current = draft;
  }, [draft, debouncedCommit]);

  /* ------------ Resets bei Elementwechsel ------------ */
  useEffect(() => {
    cancelDebounce();

    setSettings([]);
    setLoadedKey('');

    const cleanData =
      ((editedElement?.data ?? {}) as AllElementData) || ({} as AllElementData);

    setDraft(cleanData);

    setMetaName(editedElement?.name ?? '');
    setMetaVisible(!!editedElement?.visible);

    originalMetaRef.current = {
      name: editedElement?.name,
      visible: !!editedElement?.visible,
    };

    originalDataRef.current = structuredClone(cleanData);
    originalMergedRef.current = structuredClone(cleanData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageElementId]);

  /* ------------ Sync metaVisible from external context changes (e.g. preview) ------------ */
  useEffect(() => {
    const contextVisible = !!editedElement?.visible;
    if (contextVisible !== metaVisible) {
      setMetaVisible(contextVisible);
    }
    // Only react to context changes, not local metaVisible changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedElement?.visible]);

  /* ------------ Settings laden ------------ */
  useEffect(() => {
    let alive = true;
    if (!elementKey) return;

    const tokenKey = elementKey;

    (async () => {
      const s = await loadElementSettings(tokenKey);
      if (!alive) return;
      if (tokenKey !== elementKey) return;

      setSettings(s ?? []);
      setLoadedKey(tokenKey);
    })();

    return () => {
      alive = false;
    };
  }, [elementKey]);

  /* ------------ Defaults anwenden (einmalig, nur aus settings.ts) ------------ */
  useEffect(() => {
    if (!pageElementId || !loadedKey || loadedKey !== elementKey) return;

    // auch wenn keine settings existieren: als "applied" markieren,
    // sonst hängt es bei Elementwechseln.
    if (!settings?.length) {
      appliedDefaultsRef.current.add(pageElementId);
      return;
    }

    if (appliedDefaultsRef.current.has(pageElementId)) return;

    const defaults = collectDefaultsFromSettings(settings);

    const current =
      ((editedElement?.data ?? {}) as AllElementData) || ({} as AllElementData);

    const patched = deepFillMissing(
      structuredClone(current),
      defaults
    ) as AllElementData;

    const changed = JSON.stringify(current) !== JSON.stringify(patched);
    if (!changed) {
      appliedDefaultsRef.current.add(pageElementId);
      return;
    }

    // ✅ wichtig: draft setzen + element in state patchen, damit layout NICHT null bleibt
    setDraft(patched);

    startTransition(() => {
      updatePageElement(pageElementId, { data: patched });
    });

    (async () => {
      try {
        const res = await fetch(
          api.elementPath(pageElementId),
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patch: { data: patched } }),
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          addStatus({
            type: 'error',
            message:
              json?.message ?? 'Defaults konnten nicht gespeichert werden.',
          });
          return;
        }

        addStatus({
          type: 'success',
          message: json?.message ?? 'Defaults übernommen.',
        });

        originalDataRef.current = structuredClone(patched);
        originalMergedRef.current = structuredClone(patched);
        appliedDefaultsRef.current.add(pageElementId);
      } catch (e) {
        addStatus({
          type: 'error',
          message:
            e instanceof Error
              ? e.message
              : 'Fehler beim Speichern der Defaults.',
        });
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageElementId, elementKey, loadedKey, settings, editedElement?.data]);

  /* ------------ Field-Update ------------ */
  const updateField = useCallback((key: FieldKey, value: unknown) => {
    const keys = String(key).split('.'); // dot-notation

    setDraft((prev) => {
      const prevVal = getAtPath(prev, keys);
      if (Object.is(prevVal, value)) return prev;
      return setAtPath(prev, keys, value);
    });
  }, []);

  /* ------------ Tabs + Renderer ------------ */
  const tabs: TabItem[] = useMemo(() => {
    if (!settings?.length) return [];

    const renderTopGroup = (top: SettingsTopGroup) => {
      const renderNode = (
        node: FieldLeaf | SettingsSubGroup,
        idx: number
      ): React.ReactNode => {
        if (isSettingsSubGroup(node)) {
          return (
            <div
              key={`group-${top.name}-${node.name}-${idx}`}
              style={{ marginBottom: '2rem' }}
            >
              {node.name ? (
                <h4 style={{ marginBottom: '0.5rem' }}>{node.name}</h4>
              ) : null}
              {node.fields.map((child, i) => renderNode(child, i))}
            </div>
          );
        }

        if (typeof node === 'string') {
          const dataKey = node as FieldKey;
          const value = getAtPath(draft, String(dataKey).split('.'));

          return (
            <div
              key={`field-${String(dataKey)}-${idx}`}
              style={{ marginBottom: '1rem' }}
            >
              {renderField('text', {
                // name: String(dataKey),
                label: String(dataKey),
                value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange: (v: any) => updateField(dataKey, v),
                workspaceId,
              })}
            </div>
          );
        }

        if (isFieldItemObject(node)) {
          const { dataKey, type, cfg } = normalizeFieldItem(node);
          
          if (cfg.adminOnly && userRole !== 'admin') {
            return null;
          }

          const pathKeys = String(dataKey).split('.');
          const value = getAtPath(draft, pathKeys);

          const isArrayType = typeof type === 'string' && type.endsWith('[]');

          // Seeds für []-Felder ausschließlich aus settings.ts
          const itemTemplate =
            isArrayType && Array.isArray(cfg.default)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (cfg.default as any[])[0]
              : undefined;

          return (
            <div
              key={`field-${String(dataKey)}-${idx}`}
              style={{ marginBottom: '1rem' }}
            >
              {renderField(type, {
                // name: String(dataKey),
                label: cfg.title ?? String(dataKey),

                // ✅ wichtig: so kommen Defaults im UI an,
                // selbst wenn draft/path noch undefined ist (z.B. erstes Rendern)
                value: value ?? cfg.default,

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange: (v: any) => updateField(dataKey as FieldKey, v),

                options: cfg.options,
                min: cfg.min,
                max: cfg.max,
                step: cfg.step,
                rows: cfg.rows,
                placeholder: cfg.placeholder,

                itemTemplate,
                workspaceId,
                config: cfg.config,
              })}
            </div>
          );
        }

        return null;
      };

      return <div>{top.fields.map((n, i) => renderNode(n, i))}</div>;
    };

    return settings
      .map((top, i) => ({
        id:
          top.name
            ?.toLowerCase()
            ?.replace(/\s+/g, '-')
            ?.replace(/[^a-z0-9\-]/g, '') || `tab-${i}`,
        label: top.name || `Tab ${i + 1}`,
        content: renderTopGroup(top),
      }))
      .filter(Boolean) as TabItem[];
  }, [settings, draft, updateField, userRole]);

  /* ------------ SAVE / CANCEL ------------ */
  const doSave = useCallback(async (): Promise<boolean> => {
    if (!pageElementId) return false;

    try {
      cancelDebounce();

      const metaChanged =
        originalMetaRef.current?.name !== metaName ||
        !!originalMetaRef.current?.visible !== metaVisible;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { id: pageElementId, data: draft };
      if (metaChanged) body.patch = { name: metaName, visible: metaVisible };

      const res = await fetch(
        api.elementPath(pageElementId),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        addStatus({
          type: 'error',
          message: json?.message ?? 'Speichern fehlgeschlagen.',
        });
        return false;
      }

      startTransition(() => {
        updatePageElement(pageElementId, {
          data: draft,
          ...(metaChanged ? { name: metaName, visible: metaVisible } : {}),
        });
      });

      addStatus({ type: 'success', message: json?.message ?? 'Gespeichert.' });

      originalDataRef.current = structuredClone(draft);
      originalMergedRef.current = structuredClone(draft);
      originalMetaRef.current = { name: metaName, visible: metaVisible };

      return true;
    } catch (error) {
      addStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
      console.error(error);
      return false;
    }
  }, [
    pageElementId,
    draft,
    metaName,
    metaVisible,
    cancelDebounce,
    updatePageElement,
    addStatus,
  ]);

  const doCancel = useCallback(() => {
    cancelDebounce();

    if (pageElementId) {
      if (originalDataRef.current) {
        startTransition(() => {
          updatePageElement(pageElementId, {
            data: originalDataRef.current as AllElementData,
          });
        });
      }

      const origName = originalMetaRef.current?.name ?? '';
      const origVisible = !!originalMetaRef.current?.visible;

      setMetaName(origName);
      setMetaVisible(origVisible);

      startTransition(() => {
        updatePageElement(pageElementId, {
          name: origName,
          visible: origVisible,
        });
      });
    }

    if (originalMergedRef.current) {
      setDraft(originalMergedRef.current);
    }

    addStatus({ type: 'info', message: 'Daten wurden nicht gespeichert.' });
    onCancel?.();
    handleCloseModal?.();
  }, [
    pageElementId,
    cancelDebounce,
    updatePageElement,
    addStatus,
    onCancel,
    handleCloseModal,
  ]);

  useImperativeHandle(ref, () => ({ save: doSave, cancel: doCancel }));

  if (!editedElement) {
    return (
      <ContentElementSettingsWrapperContainer>
        <div style={{ padding: '1rem 0' }}>Es ist kein Element ausgewählt.</div>
      </ContentElementSettingsWrapperContainer>
    );
  }

  return (
    <ContentElementSettingsWrapperContainer key={pageElementId || elementKey} style={containerStyle}>
      {/* Navigation Toolbar */}
      <NavToolbar>
        {prevElement ? (
          <NavIconBtn onClick={() => handleNav(prevElement._id)} title="Zum vorherigen Element">
            <MdChevronLeft size={18} />
            <span>Voriges</span>
          </NavIconBtn>
        ) : <NavSpacer />}
        <CreateNavBtn onClick={() => handleCreate('before')} title="Neues Element davor einfügen">
          <MdAdd size={15} />
          <span>Davor</span>
        </CreateNavBtn>
        <NavToolbarDivider />
        <CreateNavBtn onClick={() => handleCreate('after')} title="Neues Element danach einfügen">
          <span>Danach</span>
          <MdAdd size={15} />
        </CreateNavBtn>
        {nextElement ? (
          <NavIconBtn onClick={() => handleNav(nextElement._id)} title="Zum nächsten Element">
            <span>Nächstes</span>
            <MdChevronRight size={18} />
          </NavIconBtn>
        ) : <NavSpacer />}
      </NavToolbar>
      <MetaGrid>
        <TextInput
          label="Name"
          value={metaName}
          onChange={(v) => {
            setMetaName(v);
            startTransition(() => {
              updatePageElement(pageElementId, { name: v });
            });
          }}
        />

        <VisibilityRow>
          <div style={isLocked ? { opacity: 0.5, pointerEvents: 'none' } : undefined} title={isLocked ? "Element ist geschützt (Prime)" : ""}>
            <PageElementVisibilityStatus
              value={metaVisible ? 'visible' : 'invisible'}
              onChange={async (v) => {
              if (isLocked) return;
              if (!pageElementId) return;

              const next = v === 'visible';

              // 1️⃣ UI sofort optimistisch updaten
              setMetaVisible(next);
              startTransition(() => {
                updatePageElement(pageElementId, { visible: next });
              });

              // 2️⃣ In DB speichern
              try {
                const res = await fetch(
                  api.elementPath(pageElementId),
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      patch: { visible: next },
                    }),
                  }
                );

                const json = await res.json().catch(() => ({}));

                if (!res.ok) {
                  // Rollback
                  const rollback = !next;
                  setMetaVisible(rollback);
                  startTransition(() => {
                    updatePageElement(pageElementId, { visible: rollback });
                  });

                  addStatus({
                    type: 'error',
                    message:
                      json?.message ??
                      'Sichtbarkeit konnte nicht gespeichert werden.',
                  });
                  return;
                }

                addStatus({
                  type: 'success',
                  message: json?.message ?? 'Sichtbarkeit gespeichert.',
                });

                // Originalwert aktualisieren (wichtig für Save/Cancel Logik)
                originalMetaRef.current = {
                  ...(originalMetaRef.current ?? {}),
                  visible: next,
                };
              } catch (e) {
                const rollback = !next;
                setMetaVisible(rollback);
                startTransition(() => {
                  updatePageElement(pageElementId, { visible: rollback });
                });

                addStatus({
                  type: 'error',
                  message: 'Netzwerkfehler beim Speichern der Sichtbarkeit.',
                });
              }
            }}
          />
          </div>
          
          <ScrollButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (pageElementId) {
                window.dispatchEvent(
                  new CustomEvent('pe-scroll-to', { detail: { id: pageElementId } })
                );
              }
            }}
            title="Element in den Viewport scrollen"
          >
            <TbViewportShort size={20} />
          </ScrollButton>
        </VisibilityRow>
      </MetaGrid>

      {tabs.length > 0 ? (
        <TabMenu
          data={{
            tabs,
            persistKey: `content-element-settings-tab:${
              pageElementId || elementKey || 'unknown'
            }`,
          }}
        />
      ) : (
        <div style={{ padding: '0.5rem 0 1.5rem' }}>
          {loadedKey
            ? 'Keine Settings für dieses Element definiert.'
            : 'Settings werden geladen …'}
        </div>
      )}

      <div className="flex-row">
        <Button onClick={doCancel}>Abbrechen</Button>
        <Button onClick={doSave} variant="contained">
          Speichern
        </Button>
      </div>
    </ContentElementSettingsWrapperContainer>
  );
});

ContentElementSettingsWrapper.displayName = 'ContentElementSettingsWrapper';
export default ContentElementSettingsWrapper;

/* -------- Styles -------- */
const MetaGrid = styled.fieldset`
  border: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: stretch;
  justify-content: center;
  margin-bottom: 3rem;

  @container (max-width: 640px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const VisibilityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScrollButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background-color: #caffb2;
  color: #000;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background-color: #b8f0a0;
    border-color: #a0d88e;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NavToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: #f8f9fb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;

  @container (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavToolbarDivider = styled.div`
  flex: 1;
  height: 1px;
  background: #e5e7eb;
  min-width: 8px;

  @container (max-width: 480px) {
    display: none;
  }
`;

const NavSpacer = styled.div`
  width: 0;

  @container (max-width: 480px) {
    display: none;
  }
`;

const NavIconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e0e3e8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);

  &:hover {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    box-shadow: 0 2px 8px rgba(59,130,246,0.25);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @container (max-width: 480px) {
    order: 2;
    flex: 1 1 calc(50% - 6px);
    justify-content: center;
  }
`;

const CreateNavBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 12px;
  background: transparent;
  border: 1px dashed #c7ccd4;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }

  @container (max-width: 480px) {
    order: 1;
    flex: 1 1 calc(50% - 6px);
    justify-content: center;
  }
`;
