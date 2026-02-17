// utils/PageElementMapper.tsx
// KEIN 'use client' → Server-Komponente

import React, { FC, Fragment, useMemo } from 'react';
import {
  Accordion,
  AccordionData,
  AnimatedCards,
  AnimatedCardsData,
  Breadcrumbs,
  BreadcrumbsData,
  CardsGrid,
  CardsGridData,
  ContactMap,
  ContactMapData,
  HorizontalLine,
  HorizontalLineData,
  ImageText,
  ImageTextData,
  IntroText,
  IntroTextData,
  LargeCard,
  LargeCardData,
  List,
  ListData,
  LogoGrid,
  LogoGridData,
  Metrics,
  MetricsData,
  Slider,
  SliderData,
  Spacer,
  SpacerData,
  SubFooter,
  SubFooterData,
  TabMenu,
  TabMenuData,
  VideoHero,
  VideoHeroData,
} from '@/components/content-elements/default';
import type { LanguageCode } from '@/components/language-settings/languages';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

export type PageElementMapperProps = {
  elements: PageElement[];
  currentLanguage: LanguageCode;
  sort?: boolean;
  tieBreakById?: boolean;
  showInvisibleElements?: boolean;
  renderItem?: (
    node: React.ReactNode,
    el: PageElement,
    listKey: string
  ) => React.ReactNode;
};

// Hilfsfunktion: hängt currentLanguage an data dran
function withCurrentLanguage<T>(
  data: T | undefined,
  currentLanguage: LanguageCode
): T & { currentLanguage: LanguageCode } {
  return {
    ...(data ?? ({} as T)),
    currentLanguage,
  };
}

// Sichtbarkeit
function isElementVisible(el: PageElement): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (el as any)?.visible;
  if (v === undefined) return true;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1';
  }
  if (typeof v === 'number') return v !== 0;
  return true;
}

function createNode(
  el: PageElement,
  showInvisible: boolean,
  currentLanguage: LanguageCode
): React.ReactElement | null {
  if (!el || !el.element) return null;
  const visible = showInvisible || isElementVisible(el);
  if (!visible) return null;

  switch (el.element) {
    case 'accordion':
      return (
        <Accordion
          data={withCurrentLanguage<AccordionData>(
            el.data as AccordionData,
            currentLanguage
          )}
        />
      );
    case 'animated-cards':
      return (
        <AnimatedCards
          data={withCurrentLanguage<AnimatedCardsData>(
            el.data as AnimatedCardsData,
            currentLanguage
          )}
        />
      );
    case 'breadcrumbs':
      return (
        <Breadcrumbs
          data={withCurrentLanguage<BreadcrumbsData>(
            el.data as BreadcrumbsData,
            currentLanguage
          )}
        />
      );
    case 'cards-grid':
      return (
        <CardsGrid
          data={withCurrentLanguage<CardsGridData>(
            el.data as CardsGridData,
            currentLanguage
          )}
        />
      );
    case 'contact-map':
      return (
        <ContactMap
          data={withCurrentLanguage<ContactMapData>(
            el.data as ContactMapData,
            currentLanguage
          )}
        />
      );
    case 'horizontal-line':
      return (
        <HorizontalLine
          data={withCurrentLanguage<HorizontalLineData>(
            el.data as HorizontalLineData,
            currentLanguage
          )}
        />
      );
    case 'large-card':
      return (
        <LargeCard
          data={withCurrentLanguage<LargeCardData>(
            el.data as LargeCardData,
            currentLanguage
          )}
        />
      );
    case 'image-text':
      return (
        <ImageText
          data={withCurrentLanguage<ImageTextData>(
            el.data as ImageTextData,
            currentLanguage
          )}
        />
      );
    case 'intro-text':
      return (
        <IntroText
          data={withCurrentLanguage<IntroTextData>(
            el.data as IntroTextData,
            currentLanguage
          )}
        />
      );
    case 'list':
      return (
        <List
          data={withCurrentLanguage<ListData>(
            el.data as ListData,
            currentLanguage
          )}
        />
      );
    case 'logo-grid':
      return (
        <LogoGrid
          data={withCurrentLanguage<LogoGridData>(
            el.data as LogoGridData,
            currentLanguage
          )}
        />
      );
    case 'metrics':
      return (
        <Metrics
          data={withCurrentLanguage<MetricsData>(
            el.data as MetricsData,
            currentLanguage
          )}
        />
      );
    case 'slider':
      return (
        <Slider
          data={withCurrentLanguage<SliderData>(
            el.data as SliderData,
            currentLanguage
          )}
        />
      );
    case 'spacer':
      return (
        <Spacer
          data={withCurrentLanguage<SpacerData>(
            el.data as SpacerData,
            currentLanguage
          )}
        />
      );
    case 'sub-footer':
      return (
        <SubFooter
          data={withCurrentLanguage<SubFooterData>(
            el.data as SubFooterData,
            currentLanguage
          )}
        />
      );
    case 'tab-menu':
      return (
        <TabMenu
          data={withCurrentLanguage<TabMenuData>(
            el.data as TabMenuData,
            currentLanguage
          )}
        />
      );
    case 'video-hero':
      return (
        <VideoHero
          data={withCurrentLanguage<VideoHeroData>(
            el.data as VideoHeroData,
            currentLanguage
          )}
        />
      );
    default:
      return null;
  }
}

const PageElementMapper: FC<PageElementMapperProps> = ({
  elements,
  currentLanguage,
  sort = true,
  tieBreakById = true,
  renderItem,
  showInvisibleElements = false,
}) => {
  if (process.env.NODE_ENV !== 'production') {
    // console.log(
    //   '[PageElementMapper] incoming',
    //   elements.map((e) => ({
    //     _id: String(e._id),
    //     element: e.element,
    //     order: e.order,
    //   }))
    // );
  }

  const sorted = useMemo(() => {
    const list = Array.isArray(elements) ? [...elements] : [];
    if (!sort) return list;
    list.sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      if (!tieBreakById) return 0;
      return String(a._id).localeCompare(String(b._id));
    });
    return list;
  }, [elements, sort, tieBreakById]);

  const usedKeys = new Set<string>();
  const makeListKey = (el: PageElement, idx: number): string => {
    let k = String(el._id ?? '');
    if (!k) k = `idx:${idx}`;

    if (usedKeys.has(k)) {
      console.warn('[PageElementMapper] Duplicate key detected:', k, el);
      let i = 1;
      let nk = `${k}#${i}`;
      while (usedKeys.has(nk)) {
        i += 1;
        nk = `${k}#${i}`;
      }
      k = nk;
    }
    usedKeys.add(k);
    return k;
  };

  return (
    <div
      style={{ containerType: 'inline-size', containerName: 'resizable-area' }}
    >
      {sorted.map((el, idx) => {
        const node = createNode(el, showInvisibleElements, currentLanguage);
        if (!node) return null;

        const listKey = makeListKey(el, idx);

        if (process.env.NODE_ENV !== 'production') {
          // console.log('[PageElementMapper] render', {
          //   listKey,
          //   element: el.element,
          //   id: String(el._id),
          // });
        }

        if (renderItem) {
          return renderItem(node, el, listKey);
        }

        return <Fragment key={listKey}>{node}</Fragment>;
      })}
    </div>
  );
};

export default PageElementMapper;
