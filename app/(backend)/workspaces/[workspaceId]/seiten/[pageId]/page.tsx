// app/(backend)/workspaces/[id]/languages/page.tsx
import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  IconProps,
  UnwrappedAnimatedCards,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from './utils/getPage';
import { PageProvider } from '@/components/PageContext';
import { BorderRadiusOptions } from '@/components/content-elements/default/types';
import { CardProps } from '@/components/content-elements/default/animated-cards/component/AnimatedCards.types';
import Spacer from '@/components/content-elements/default/spacer';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ workspaceId: string; pageId: string }>;
}) {
  const { workspaceId, pageId } = await params;
  const page = await getPage(pageId);

  if (!page) {
    return notFound();
  }

  const elements = [
    {
      title: { de: 'Seiteneinstellungen', en: 'Page settings' },
      icon: 'MdOutlineSettings',
      teaser: {
        de: 'Lorem ipsum dolor sit amet.',
        en: 'Lorem ipsum dolor sit amet.',
      },
      slug: `/workspaces/${workspaceId}/seiten/${pageId}/einstellungen`,
    },
    {
      title: { de: 'Seitenelemente', en: 'Page Elements' },
      icon: 'TfiViewList',
      teaser: {
        de: 'Lorem ipsum dolor sit amet.',
        en: 'Lorem ipsum dolor sit amet.',
      },
      slug: `/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`,
    },
    {
      title: { de: 'SEO-Einstellungen', en: 'SEO Settings' },
      icon: 'TbSeo',
      teaser: {
        de: 'Lorem ipsum dolor sit amet.',
        en: 'Lorem ipsum dolor sit amet.',
      },
      slug: `/workspaces/${workspaceId}/seiten/${pageId}/seo`,
    },
    {
      title: { de: 'Analyse', en: 'Analysis' },
      icon: 'GrAnalytics',
      teaser: {
        de: 'Lorem ipsum dolor sit amet.',
        en: 'Lorem ipsum dolor sit amet.',
      },
      slug: `/workspaces/${workspaceId}/seiten/${pageId}/analyse`,
    },
  ].filter((item) => {
    // Slugs, für die SEO/Analyse ausgeblendet werden soll
    const NO_SEO_SLUGS = ['404'];
    const isRestricted = NO_SEO_SLUGS.includes(page.slug);

    if (isRestricted) {
      if (item.title.de === 'SEO-Einstellungen') return false;
      if (item.title.de === 'Analyse') return false;
    }
    return true;
  });

  const asIconName = (name?: string) => name as IconProps['name'] | undefined;

  // ✅ WICHTIG: cards explizit typisieren
  const cards: CardProps[] = elements.map((element) => ({
    title: {
      value: {
        element: 'div' as const, // 🔒 Literal bleibt Literal
        value: {
          de: element.title.de,
          en: element.title.en,
        },
      },
      color: '#0a4a7b',
      hoverColor: '#ffffff',
      align: 'left',
      transform: 'normal',
    },
    subtitle: {
      value: {
        element: 'div' as const, // 🔒 Literal bleibt Literal
        value: {
          de: element.teaser.de,
          en: element.teaser.en,
        },
      },
      color: '#666666',
      hoverColor: '#e1e1e1',
      align: 'left',
      transform: 'normal',
    },
    icon: {
      name: asIconName(element.icon),
      small: { color: '#0a4a7b', hoverColor: '#ffffff' },
      large: { color: '#f0f3ff', hoverColor: '#327bb3' },
    },
    href: element.slug,
    newTab: false,
    overlayColor: '#0a4a7b',
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    borderRadius: 'm' as BorderRadiusOptions,
  }));

  return (
    <PageProvider>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
          },
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Seiten', en: 'Pages' },
              href: {
                de: `/workspaces/${workspaceId}/seiten`,
                en: `/workspaces/${workspaceId}/seiten`,
              },
              highlighted: false,
            },
            {
              label: { de: `Seite "${page.name}"`, en: `Page "${page.name}"` },
              highlighted: true,
            },
          ],
        }}
      />
      <Wrapper
        data={{
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
              <Heading element="h1" value={`Seite "${page.name}"`} />
              <Spacer data={{ size: 's' }} />
              <UnwrappedAnimatedCards
                data={{
                  cards,
                  currentLanguage: 'de',
                }}
              />
            </>
          ),
        }}
      />
    </PageProvider>
  );
}
