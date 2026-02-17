// components/usePageElements.ts
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
import {
  resolveElementDefaults,
  deepFillMissing,
} from '@/utils/elementDefaults';
import { nanoid } from 'nanoid';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

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
  editingPageElementId: string | null;
  setEditingPageElementId: (id: string | null) => void;

  /** Das aktuell editierte Element (abgeleitet) */
  editingElement: PageElement | undefined;

  /** Nur Daten des aktuell editierten Elements patchen */
  updateEditingElementData: (
    patch:
      | Partial<PageElement['data']>
      | ((prev: PageElement['data']) => PageElement['data'])
  ) => void;

  /** Element erstellen (Defaults werden beim Anlegen eingemischt) */
  createPageElement: (
    elementKey: string,
    options?: {
      name?: string;
      visible?: boolean;
      order?: number;
      initialData?: Partial<PageElement['data']>;
      id?: string; // optional, falls du eine feste ID setzen willst
    }
  ) => Promise<PageElement>;

  /** Revision-Zähler: erhöht sich bei jeder Mutation */
  revision: number;
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

  // Sync state with initialElements when they change (e.g. navigation)
  useEffect(() => {
      setPageElementsState(initialElements);
  }, [initialElements]);

  const [editingPageElementId, setEditingPageElementId] = useState<
    string | null
  >(null);

  /** Revision-Zähler: triggert Re-Render/Remount in der Preview */
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((r) => r + 1), []);

  // Optional: Persistenz laden
  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PageElement[];
        if (Array.isArray(parsed)) {
          setPageElementsState(parsed);
          // KEIN bump() hier – initialer Load soll nicht remounten müssen
        }
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

  const setPageElements = useCallback(
    (elements: PageElement[]) => {
      setPageElementsState(elements);
      bump();
    },
    [bump]
  );

  const upsertPageElement = useCallback(
    (element: PageElement) => {
      setPageElementsState((prev) => {
        const idx = prev.findIndex((e) => e._id === element._id);
        if (idx === -1) return [...prev, element];
        const clone = [...prev];
        clone[idx] = element;
        return clone;
      });
      bump();
    },
    [bump]
  );

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
      bump();
    },
    [bump]
  );

  const removePageElement = useCallback(
    (id: string) => {
      setPageElementsState((prev) => prev.filter((e) => e._id !== id));
      bump();
    },
    [bump]
  );

  const getPageElement = useCallback(
    (id: string) => pageElements.find((e) => e._id === id),
    [pageElements]
  );

  const clear = useCallback(() => {
    setPageElementsState([]);
    bump();
  }, [bump]);

  const reorderByIds = useCallback(
    (orderedIds: string[]) => {
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
      bump();
    },
    [bump]
  );

  const editingElement = useMemo(
    () =>
      editingPageElementId ? getPageElement(editingPageElementId) : undefined,
    [editingPageElementId, getPageElement]
  );

  const updateEditingElementData = useCallback(
    (
      patch:
        | Partial<PageElement['data']>
        | ((prev: PageElement['data']) => PageElement['data'])
    ) => {
      if (!editingPageElementId) return;
      setPageElementsState((prev) => {
        const idx = prev.findIndex((e) => e._id === editingPageElementId);
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
      bump();
    },
    [editingPageElementId, bump]
  );

  /** ---------------- Element erstellen (mit Defaults) ---------------- */
  const createPageElement: PageElementsContextType['createPageElement'] =
    useCallback(
      async (elementKey, options) => {
        const {
          name = '',
          visible = true,
          order,
          initialData = {},
          id,
        } = options ?? {};

        // 1) optionale Defaults laden
        const defaults = await resolveElementDefaults(elementKey).catch(
          () => ({})
        );

        // 2) initialData über Defaults mergen (Defaults füllen nur Lücken)
        const data = deepFillMissing(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { ...(initialData as any) },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          defaults as any
        );

        // 3) Element-Objekt bauen
        const el: PageElement = {
          _id: id ?? nanoid(),
          element: elementKey,
          name,
          visible,
          order: typeof order === 'number' ? order : pageElements.length + 1,
          data,
          pageId: '',
          createdAt: new Date(),
        };

        // 4) einfügen
        upsertPageElement(el); // bump() passiert innerhalb von upsert

        return el;
      },
      [pageElements.length, upsertPageElement]
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
      editingPageElementId,
      setEditingPageElementId,
      editingElement,
      updateEditingElementData,
      createPageElement,
      revision, // <- wichtig für Preview-Remounts
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
      editingPageElementId,
      editingElement,
      updateEditingElementData,
      createPageElement,
      revision,
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

/** Safe variant: returns null when used outside PageElementsProvider */
export const useOptionalPageElements = (): PageElementsContextType | null => {
  return useContext(PageElementsContext) ?? null;
};
