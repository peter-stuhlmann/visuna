'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
  type FC,
} from 'react';
import type { PageElement } from '@/components/content-elements/default/types';

type PageElementsContextType = {
  /** Liste aller Elemente */
  pageElements: PageElement[];
  /** Ersetzt die gesamte Liste */
  setPageElements: (elements: PageElement[]) => void;

  /** Fügt hinzu oder ersetzt ein Element mit gleicher _id */
  upsertPageElement: (element: PageElement) => void;

  /** Aktualisiert ein Element per _id (Partial oder Updater-Funktion) */
  updatePageElement: (
    id: string,
    patch:
      | Partial<PageElement>
      | ((prev: PageElement) => PageElement | Partial<PageElement>)
  ) => void;

  /** Entfernt ein Element per _id */
  removePageElement: (id: string) => void;

  /** Holt ein Element per _id (oder undefined) */
  getPageElement: (id: string) => PageElement | undefined;

  /** Alle löschen */
  clear: () => void;

  /** Reorder anhand neuer Order-Liste (Array von _id) */
  reorderByIds: (orderedIds: string[]) => void;

  /** ID des aktuell editierten Elements (Modal etc.) */
  editingElementId: string | null;
  setEditingElementId: (id: string | null) => void;

  /** Das aktuell editierte Element (abgeleitet) */
  editingElement: PageElement | undefined;

  /** Nur Daten des aktuell editierten Elements patchen */
  updateEditingElementData: (
    patch:
      | Partial<PageElement['data']>
      | ((prev: PageElement['data']) => PageElement['data'])
  ) => void;
};

const PageElementsContext = createContext<PageElementsContextType | undefined>(
  undefined
);

type PageElementsProviderProps = {
  children: ReactNode;
  /** Initiale Elemente (z. B. aus Server-Fetch) */
  initialElements?: PageElement[];
  /** Optional: Key zum Persistieren in localStorage */
  persistKey?: string;
};

export const PageElementsProvider: FC<PageElementsProviderProps> = ({
  children,
  initialElements = [],
  persistKey,
}) => {
  const [pageElements, setPageElementsState] =
    useState<PageElement[]>(initialElements);

  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  // Optional: Persistenz laden
  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PageElement[];
        if (Array.isArray(parsed)) setPageElementsState(parsed);
      }
    } catch {
      // ignore
    }
    // nur einmal beim Mount
  }, [persistKey]);

  // Optional: Persistenz schreiben
  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(persistKey, JSON.stringify(pageElements));
    } catch {
      // ignore
    }
  }, [persistKey, pageElements]);

  const setPageElements = useCallback((elements: PageElement[]) => {
    setPageElementsState(elements);
  }, []);

  const upsertPageElement = useCallback((element: PageElement) => {
    setPageElementsState((prev) => {
      const idx = prev.findIndex((e) => e._id === element._id);
      if (idx === -1) return [...prev, element];
      const clone = [...prev];
      clone[idx] = element;
      return clone;
    });
  }, []);

  const updatePageElement = useCallback(
    (
      id: string,
      patch:
        | Partial<PageElement>
        | ((prev: PageElement) => PageElement | Partial<PageElement>)
    ) => {
      setPageElementsState((prev) => {
        const idx = prev.findIndex((e) => e._id === id);
        if (idx === -1) return prev;
        const current = prev[idx];

        const next =
          typeof patch === 'function'
            ? patch(current)
            : { ...current, ...patch };

        // Falls Updater ein Partial zurückgibt: zusammenführen
        const merged =
          typeof patch === 'function'
            ? { ...current, ...(next as Partial<PageElement>) }
            : (next as PageElement);

        const clone = [...prev];
        clone[idx] = merged;
        return clone;
      });
    },
    []
  );

  const removePageElement = useCallback((id: string) => {
    setPageElementsState((prev) => prev.filter((e) => e._id !== id));
  }, []);

  const getPageElement = useCallback(
    (id: string) => pageElements.find((e) => e._id === id),
    [pageElements]
  );

  const clear = useCallback(() => setPageElementsState([]), []);

  const reorderByIds = useCallback((orderedIds: string[]) => {
    setPageElementsState((prev) => {
      const map = new Map(prev.map((e) => [e._id, e]));
      const reordered: PageElement[] = [];
      for (const id of orderedIds) {
        const item = map.get(id);
        if (item) reordered.push(item);
      }
      // Hänge evtl. übrig gebliebene Elemente hinten an (falls IDs unvollständig)
      for (const e of prev) {
        if (!orderedIds.includes(e._id)) reordered.push(e);
      }
      // Konsistente order-Felder
      return reordered.map((e, idx) => ({ ...e, order: idx + 1 }));
    });
  }, []);

  const editingElement = useMemo(
    () => (editingElementId ? getPageElement(editingElementId) : undefined),
    [editingElementId, getPageElement]
  );

  const updateEditingElementData = useCallback(
    (
      patch:
        | Partial<PageElement['data']>
        | ((prev: PageElement['data']) => PageElement['data'])
    ) => {
      if (!editingElementId) return;
      setPageElementsState((prev) => {
        const idx = prev.findIndex((e) => e._id === editingElementId);
        if (idx === -1) return prev;
        const current = prev[idx];
        const nextData =
          typeof patch === 'function'
            ? patch(current.data ?? ({} as PageElement['data']))
            : { ...(current.data ?? {}), ...patch };

        const clone = [...prev];
        clone[idx] = { ...current, data: nextData };
        return clone;
      });
    },
    [editingElementId]
  );

  const value = useMemo(
    () => ({
      pageElements,
      setPageElements,
      upsertPageElement,
      updatePageElement,
      removePageElement,
      getPageElement,
      clear,
      reorderByIds,
      editingElementId,
      setEditingElementId,
      editingElement,
      updateEditingElementData,
    }),
    [
      pageElements,
      setPageElements,
      upsertPageElement,
      updatePageElement,
      removePageElement,
      getPageElement,
      clear,
      reorderByIds,
      editingElementId,
      editingElement,
      updateEditingElementData,
    ]
  );

  return (
    <PageElementsContext.Provider value={value}>
      {children}
    </PageElementsContext.Provider>
  );
};

export const usePageElements = (): PageElementsContextType => {
  const ctx = useContext(PageElementsContext);
  if (!ctx) {
    throw new Error(
      'usePageElements must be used within a PageElementsProvider'
    );
  }
  return ctx;
};
