import {
  Breadcrumbs,
  Heading,
  IconProps,
  Spacer,
  UnwrappedAnimatedCards,
  Wrapper,
} from '@/components/content-elements/default';
import { BorderRadiusOptions } from '@/components/content-elements/default/types';
import { getLocale } from 'next-intl/server';
import type { LanguageCode } from '@/components/language-settings/languages';

/* =======================
   AnimatedCards helpers (NEU only)
   (Breadcrumbs ist bei dir jetzt LocalizedString-only)
======================= */

type LocalizedString = Record<string, string>;
type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type LocalizedFieldValue = {
  value: LocalizedString;
  element: SingleLineElement;
};

const lf = (
  value: LocalizedString,
  element: SingleLineElement = 'div'
): LocalizedFieldValue => ({
  value,
  element,
});

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const locale = (await getLocale()) as LanguageCode;

  const asIconName = (name?: string) => name as IconProps['name'] | undefined;

  const workspaceCards = [
    {
      title: { de: 'Sprachen', en: 'Languages' },
      icon: 'MdOutlineLanguage',
      subtitle: {
        de: 'Sprachen, die Deine Website unterstützt.',
        en: 'Languages supported by your website.',
      },
      slug: `/workspaces/${workspaceId}/sprachen`,
    },
    {
      title: { de: 'Benutzerverwaltung', en: 'User Management' },
      icon: 'LiaUsersCogSolid',
      subtitle: {
        de: 'Rollen und Berechtigungen für Benutzer.',
        en: 'Roles and permissions for users.',
      },
      slug: `/workspaces/${workspaceId}/benutzerverwaltung`,
    },
    {
      title: { de: 'Default-Einstellungen', en: 'Default Settings' },
      icon: 'IoMdSettings',
      subtitle: {
        de: 'Default-Einstellungen für den Workspace.',
        en: 'Default settings for the workspace.',
      },
      slug: `/workspaces/${workspaceId}/default-einstellungen`,
    },
    {
      title: { de: 'Aktivitätenprotokoll', en: 'Activity Log' },
      icon: 'TbLogs',
      subtitle: {
        de: 'Logs für den Workspace.',
        en: 'Logs for the workspace.',
      },
      slug: `/workspaces/${workspaceId}/logs`,
    },
  ];

  const generalCards = [
    {
      title: { de: 'Mein Profil', en: 'My Profile' },
      icon: 'TbUser',
      subtitle: {
        de: 'Profilinformationen und -einstellungen.',
        en: 'Profile information and settings.',
      },
      slug: `/profil`,
    },
  ];

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          currentLanguage: locale, // ✅ Breadcrumbs liest das
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
              label: {
                de: 'Einstellungen',
                en: 'Settings',
              },
              highlighted: true,
              // ✅ kein href => wird als <span> gerendert
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
              <Heading element="h1" value="Einstellungen" />
              <Heading
                element="h2"
                value={'Allgemeine Einstellungen und mein Profil'}
              />
              <UnwrappedAnimatedCards
                data={{
                  cards: generalCards.map((generalCard, idx: number) => {
                    return {
                      title: {
                        value: {
                          value: {
                            de: generalCard.title.de,
                            en: generalCard.title.en,
                          },
                          element: 'h3',
                        },
                        color: '#0a4a7b',
                        hoverColor: '#ffffff',
                        align: 'left' as const,
                        transform: 'normal' as const,
                      },
                      subtitle: {
                        value: {
                          value: {
                            de: generalCard.subtitle.de,
                            en: generalCard.subtitle.en,
                          },
                          element: 'div',
                        },
                        color: '#666666',
                        hoverColor: '#e1e1e1',
                        align: 'left' as const,
                        transform: 'normal' as const,
                      },
                      icon: {
                        name: asIconName(generalCard.icon),
                        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
                        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
                      },
                      href: generalCard.slug,
                      newTab: false,
                      overlayColor: '#0a4a7b',
                      backgroundColor: '#ffffff',
                      borderColor: '#cccccc',
                      borderRadius: 'm' as BorderRadiusOptions,
                    };
                  }),
                  currentLanguage: locale,
                }}
              />
            </>
          ),
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
              <Heading element="h2" value="Workspace-Einstellungen" />
              <UnwrappedAnimatedCards
                data={{
                  cards: workspaceCards.map((workspaceCard) => {
                    return {
                      title: {
                        value: lf(workspaceCard.title, 'h3'),
                        color: '#0a4a7b',
                        hoverColor: '#ffffff',
                        align: 'left' as const,
                        transform: 'normal' as const,
                      },
                      subtitle: {
                        value: lf(workspaceCard.subtitle, 'div'),
                        color: '#666666',
                        hoverColor: '#e1e1e1',
                        align: 'left' as const,
                        transform: 'normal' as const,
                      },
                      icon: {
                        name: asIconName(workspaceCard.icon),
                        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
                        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
                      },
                      href: workspaceCard.slug,
                      newTab: false,
                      overlayColor: '#0a4a7b',
                      backgroundColor: '#ffffff',
                      borderColor: '#cccccc',
                      borderRadius: 'm' as BorderRadiusOptions,
                    };
                  }),
                  currentLanguage: locale,
                }}
              />
            </>
          ),
        }}
      />
    </>
  );
}
