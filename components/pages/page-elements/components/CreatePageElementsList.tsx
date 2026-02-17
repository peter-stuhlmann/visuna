'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import contentElementsMetaData from '@/data/content-elements-metadata';
import { usePageElements } from '@/components/usePageElements';
import { BorderRadiusOptions } from '@/components/content-elements/default/types';
import { useStatus } from '../../../status/StatusContext';
import {
  IconProps,
  UnwrappedAnimatedCards,
} from '../../../content-elements/default';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import { PageElementsSearch } from '@/components/page-elements-search/PageElementsSearch';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

/* ---------------------------------- types ---------------------------------- */

type LocalizedHtml = Record<string, string>;
type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

type ContentLanguage =
  keyof (typeof contentElementsMetaData)[number]['elements'][number]['title'];

const toLocalizedFieldValue = (
  map: Record<string, string> | undefined,
  element: SingleLineElement
): LocalizedFieldValue => ({
  value: (map ?? {}) as LocalizedHtml,
  element,
});

type Props = {
  workspaceId: string;
  pageId: string;
  onCreated?: (id?: string) => void;
};

type SearchItem = {
  categoryIndex: number;
  categoryTitle: string;
  element: (typeof contentElementsMetaData)[number]['elements'][number];
};

/* -------------------------------- component -------------------------------- */

export default function CreatePageClientWrapper({
  workspaceId,
  pageId,
  onCreated,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addStatus } = useStatus();

  const { pageElements, setPageElements, setEditingPageElementId } =
    usePageElements();

  const afterId: string | null = useMemo(() => {
    const raw = (searchParams.get('afterId') || '').trim();
    return raw || null;
  }, [searchParams]);

  const asIconName = (name?: string) => name as IconProps['name'] | undefined;
  const currentLanguage = useMemo(
    () => DEFAULT_LANGUAGES[0] as ContentLanguage,
    []
  );

  /* --------------------------- CREATE ELEMENT --------------------------- */

  const handleCreate =
    (elementSlug: string) =>
    async (e?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e?.preventDefault?.();

      try {
        const current = Array.isArray(pageElements) ? pageElements : [];

        const insertIndex = (() => {
          if (!afterId) return 0;
          const idx = current.findIndex(
            (p) => String(p._id) === String(afterId)
          );
          if (idx === -1) return current.length;
          return idx + 1;
        })();

        const prev = current[insertIndex - 1];
        const next = current[insertIndex];

        const prevOrder = prev?.order != null ? Number(prev.order) : null;
        const nextOrder = next?.order != null ? Number(next.order) : null;

        let nextOrderValue =
          prevOrder != null && nextOrder != null
            ? (prevOrder + nextOrder) / 2
            : prevOrder != null
            ? prevOrder + 1
            : nextOrder != null
            ? nextOrder - 1
            : current.length + 1;

        const res = await fetch(
          `/api/workspaces/${workspaceId}/pages/${pageId}/page-elements`,
          {
            method: 'POST',
            body: JSON.stringify({
              pageId,
              element: elementSlug,
              order: nextOrderValue,
            }),
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          }
        );

        if (!res.ok) return;

        const json = await res.json();
        const id: string | undefined = json?.element?._id; // Updated to check json.element._id based on likely response structure
        if (!id) return;

        addStatus({
          type: 'success',
          message: json?.message ?? 'Element wurde angelegt.',
        });

        const optimistic: PageElement = {
          _id: id,
          element: elementSlug,
          name: elementSlug,
          data: {},
          order: nextOrderValue,
          visible: false,
          pageId,
          createdAt: new Date(),
        };

        const nextList = [...current];
        nextList.splice(insertIndex, 0, optimistic);
        setPageElements(nextList);

        setEditingPageElementId(id);
        onCreated?.(id);

        requestAnimationFrame(() => {
          window.dispatchEvent(
            new CustomEvent('pe-scroll-to', { detail: { id } })
          );
        });
      } catch {}
    };

  /* --------------------------- SEARCH DATA --------------------------- */

  const allItems: SearchItem[] = useMemo(() => {
    return contentElementsMetaData.flatMap((category, categoryIndex) =>
      category.elements.map((element) => ({
        categoryIndex,
        categoryTitle: category.title,
        element,
      }))
    );
  }, []);

  const [filteredItems, setFilteredItems] = useState<SearchItem[]>(allItems);

  /* ------------------------ GROUP FILTERED BY CATEGORY ----------------------- */

  const grouped = useMemo(() => {
    const map = new Map<number, SearchItem[]>();

    for (const item of filteredItems) {
      if (!map.has(item.categoryIndex)) map.set(item.categoryIndex, []);
      map.get(item.categoryIndex)!.push(item);
    }

    return map;
  }, [filteredItems]);

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <>
      <PageElementsSearch<SearchItem>
        items={allItems}
        onFilteredChange={(items) => setFilteredItems(items)}
        getName={(i) => i.element.title?.[currentLanguage] ?? ''}
        getDescription={(i) => i.element.teaser?.[currentLanguage] ?? ''}
        getTags={(i) => i.element.tags}
        isPremium={(i) => Boolean(i.element.premium)}
      />

      {Array.from(grouped.entries()).map(([categoryIndex, items]) => {
        const category = contentElementsMetaData[categoryIndex];

        const cards = items.map(({ element }) => ({
          title: {
            value: toLocalizedFieldValue(element.title, 'h3'),
            color: '#0a4a7b',
            hoverColor: '#ffffff',
            align: 'left' as const,
            transform: 'normal' as const,
          },
          subtitle: {
            value: toLocalizedFieldValue(element.teaser, 'div'),
            color: '#666666',
            hoverColor: '#e1e1e1',
            align: 'left' as const,
            transform: 'normal' as const,
          },
          icon: {
            name: asIconName(element.icon),
            small: { color: '#0a4a7b', hoverColor: '#ffffff' },
            large: { color: '#f0f3ff', hoverColor: '#327bb3' },
          },
          href: '',
          newTab: false,
          overlayColor: '#0a4a7b',
          backgroundColor: '#ffffff',
          borderColor: '#cccccc',
          borderRadius: 'm' as BorderRadiusOptions,
          onClick: (e?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
            void handleCreate(element.slug.replace('/', ''))(e);
          },
        }));

        return (
          <div key={category.title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>{category.title}</h2>
            <UnwrappedAnimatedCards data={{ cards, currentLanguage }} />
          </div>
        );
      })}
    </>
  );
}
