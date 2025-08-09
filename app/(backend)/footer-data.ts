import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { FooterData } from '@/components/content-elements/default/footer/footer/component/Footer.types';

const footerData: FooterData = {
  backgroundColor: getPrimaryColor()['100'],
  title: {
    de: 'VISUNA',
    en: 'VISUNA',
  },
  nav: [
    {
      title: {
        de: 'Sprachen (Backend)',
        en: 'Languages (Backend)',
      },
      links: [
        {
          name: {
            de: 'Deutsch',
            en: 'German',
          },
          href: '/de',
        },
        {
          name: {
            de: 'Englisch',
            en: 'English',
          },
          href: '/en',
        },
      ],
    },
    {
      title: {
        de: 'Navigation',
        en: 'Navigation',
      },
      links: [
        {
          name: {
            de: 'Workspaces',
            en: 'Workspaces',
          },
          href: '/workspaces',
        },
        {
          name: {
            de: 'Benutzerverwaltung',
            en: 'User management',
          },
          href: '/user-management',
        },
      ],
    },
    {
      title: {
        de: 'Rechtliches',
        en: 'Legal',
      },
      links: [
        {
          name: {
            de: 'Impressum',
            en: 'Legal notice',
          },
          href: 'legalnotice',
        },
        {
          name: {
            de: 'Datenschutz',
            en: 'Privacy policy',
          },
          href: 'privacypolicy',
        },
      ],
    },
  ],
  subFooter: {
    fontSize: 'small',
    align: 'center',
    content: {
      de: 'Designt und entwickelt von Peter R. Stuhlmann</a>.',
      en: 'Designed and developed by Peter R. Stuhlmann</a>.',
    },
  },
};

export default footerData;
