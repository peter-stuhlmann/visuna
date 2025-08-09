// ContentElementSettingsWrapper.tsx
'use client';

import React, {
  FC,
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
  startTransition,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ContentElementSettingsWrapperContainer } from './ContentElementSettingsWrapper.styles';
import { defineGroupedFields } from '@/app/(backend)/workspaces/[id]/seiten/[pageId]/seitenelemente/[pageElementId]/utils/defineFields';
import {
  contentFieldConfigs,
  styleFieldConfigs,
} from '@/app/(backend)/workspaces/[id]/seiten/[pageId]/seitenelemente/[pageElementId]/utils/elementConfig';
import { Button } from '../content-elements/default';
import {
  AllElementData,
  FieldKey,
  FieldTypeMap,
} from '../content-elements/default/types';
import TabMenu from '../content-elements/default/menu/tab-menu';
import { useStatus } from '../status/StatusContext';
import { groupLabels } from '@/data/group-labels';
import { TabItem } from '../content-elements/default/menu/tab-menu/component/TabMenu.types';
import { usePageElements } from '../usePageElements';
import {
  withElementDefaults,
  pageElementDefaultData,
} from '@/data/page-elements-defaults';

const currentLang = 'de';

export type ContentElementSettingsWrapperHandle = {
  save: () => Promise<boolean>;
  cancel: () => void;
};

type Props = {
  handleCloseModal: () => void;
  onCancel?: () => void;
};

/** Debounced-Callback (trailing) + cancel handle */
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
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

/** get/set by path (immutable) */
const getAtPath = (obj: unknown, keys: string[]): unknown => {
  let acc: unknown = obj;
  for (const k of keys) {
    if (
      typeof acc === 'object' &&
      acc !== null &&
      !Array.isArray(acc) &&
      k in (acc as Record<string, unknown>)
    ) {
      acc = (acc as Record<string, unknown>)[k];
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
  const next: Record<string, unknown> = Array.isArray(base)
    ? ([...base] as unknown as Record<string, unknown>)
    : ({ ...base } as Record<string, unknown>);

  let cur: Record<string, unknown> | undefined = next;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (i === keys.length - 1) {
      cur[k] = value as unknown;
    } else {
      const v = cur[k];
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        cur[k] = { ...(v as Record<string, unknown>) };
      } else {
        cur[k] = {};
      }
      cur = cur[k] as Record<string, unknown>;
    }
  }
  return next as AllElementData;
};

const ContentElementSettingsWrapper = forwardRef<
  ContentElementSettingsWrapperHandle,
  Props
>(({ handleCloseModal, onCancel }, ref) => {
  const { addStatus } = useStatus();
  const { pageElements, editingElementId, updatePageElement } =
    usePageElements();

  const elementIndex = useMemo(
    () => pageElements.findIndex((el) => el._id === editingElementId),
    [pageElements, editingElementId]
  );
  const editedElement =
    elementIndex >= 0 ? pageElements[elementIndex] : undefined;

  const elementKey = (editedElement?.element ??
    '') as keyof typeof pageElementDefaultData;

  const mergedForForm = useMemo<AllElementData>(() => {
    if (!editedElement) return {} as AllElementData;
    return withElementDefaults(elementKey, editedElement.data);
  }, [editedElement, elementKey]);

  const [draft, setDraft] = useState<AllElementData>(mergedForForm);

  // snapshots
  const originalDataRef = useRef<AllElementData | null>(null);
  const originalMergedRef = useRef<AllElementData | null>(null);

  useEffect(() => {
    if (!editedElement) return;
    setDraft(mergedForForm);
    originalDataRef.current = structuredClone(
      editedElement.data
    ) as AllElementData;
    originalMergedRef.current = structuredClone(
      mergedForForm
    ) as AllElementData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedElement?._id]);

  // live preview commit
  const commitFn = useCallback(
    (data: AllElementData) => {
      if (!editedElement) return;
      startTransition(() => {
        updatePageElement(editedElement._id, { data });
      });
    },
    [editedElement, updatePageElement]
  );

  const [debouncedCommit, cancelDebounce] = useDebouncedCallback(commitFn, 150);

  const lastRef = useRef<AllElementData>(draft);
  useEffect(() => {
    if (lastRef.current === draft) return;
    debouncedCommit(draft);
    lastRef.current = draft;
  }, [draft, debouncedCommit]);

  const updateField = useCallback(
    <K extends keyof FieldTypeMap>(key: K, value: FieldTypeMap[K]) => {
      const keys = (key as string).split('.');
      setDraft((prev) => {
        const prevVal = getAtPath(prev, keys);
        if (Object.is(prevVal, value)) return prev;
        return setAtPath(prev, keys, value);
      });
    },
    []
  );

  const groupedContentConfigs =
    (editedElement &&
      contentFieldConfigs[
        editedElement.element as keyof typeof contentFieldConfigs
      ]) ??
    {};
  const groupedStyleConfigs =
    (editedElement &&
      styleFieldConfigs[
        editedElement.element as keyof typeof styleFieldConfigs
      ]) ??
    {};

  const renderGroupedFields = (
    groupedConfigs: Record<string, readonly FieldKey[]>
  ) =>
    defineGroupedFields(groupedConfigs, draft, updateField).map(
      ({ groupName, fields }) => (
        <div key={groupName} style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>
            {groupLabels[groupName]?.[currentLang] ?? groupName}
          </h4>
          {fields.map(({ key, component }) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              {component}
            </div>
          ))}
        </div>
      )
    );

  const renderedContentFields = renderGroupedFields(groupedContentConfigs);
  const renderedStyleFields = renderGroupedFields(groupedStyleConfigs);

  const tabs = [
    renderedContentFields?.length && {
      id: 'content',
      label: 'Content',
      content: <div>{renderedContentFields}</div>,
    },
    renderedStyleFields?.length && {
      id: 'styles',
      label: 'Styles',
      content: <div>{renderedStyleFields}</div>,
    },
  ].filter(Boolean) as TabItem[];

  // save logic (returns success)
  const doSave = useCallback(async (): Promise<boolean> => {
    if (!editedElement) return false;
    try {
      cancelDebounce();
      commitFn(draft);

      const response = await fetch('/api/update-page-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editedElement._id, data: draft }),
      });
      const res = await response.json();
      if (!response.ok) {
        addStatus({ type: 'info', message: res?.message ?? 'Fehler' });
        return false;
      }
      addStatus({ type: 'success', message: res?.message ?? 'Gespeichert' });

      // refresh snapshots
      originalDataRef.current = structuredClone(draft);
      originalMergedRef.current = structuredClone(
        withElementDefaults(
          editedElement.element as keyof typeof pageElementDefaultData,
          draft
        )
      ) as AllElementData;

      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unbekannter Fehler';
      addStatus({ type: 'error', message: msg });
      console.error(error);
      return false;
    }
  }, [editedElement, draft, cancelDebounce, commitFn, addStatus]);

  const doCancel = useCallback(() => {
    cancelDebounce();
    if (editedElement && originalDataRef.current) {
      startTransition(() => {
        updatePageElement(editedElement._id, {
          data: originalDataRef.current as AllElementData,
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
    editedElement,
    cancelDebounce,
    updatePageElement,
    addStatus,
    onCancel,
    handleCloseModal,
  ]);

  useImperativeHandle(ref, () => ({
    save: doSave,
    cancel: doCancel,
  }));

  if (!editedElement) {
    return (
      <ContentElementSettingsWrapperContainer>
        <div style={{ padding: '1rem 0' }}>Es ist kein Element ausgewählt.</div>
      </ContentElementSettingsWrapperContainer>
    );
  }

  return (
    <ContentElementSettingsWrapperContainer>
      <TabMenu tabs={tabs} persistKey="content-element-settings-tab" />
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
