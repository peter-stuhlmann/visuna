import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { FooterData } from '@/components/content-elements/default/footer/component/Footer.types';

const footerData: FooterData = {
  backgroundColor: getPrimaryColor()['700'],
  textColor: getPrimaryColor()['50'],
  title: {
    de: 'VISUNA',
    en: 'VISUNA',
  },
  nav: [
    {
      title: {
        de: 'Dokumentation',
        en: 'Documentation',
      },
      links: [
        {
          name: {
            de: 'Demo-Projekt',
            en: 'Demo Project',
          },
          href: '/demo',
        },
        {
          name: {
            de: 'Login',
            en: 'Login',
          },
          href: '/dashboard',
        },
      ],
    },
    {
      title: {
        de: 'Kontakt',
        en: 'Get in Touch',
      },
      links: [
        {
          name: {
            de: 'Kontakt-Formular',
            en: 'Contact form',
          },
          href: '#',
        },
        {
          name: {
            de: 'E-Mail',
            en: 'Email',
          },
          href: 'mailto:info@peter-stuhlmann.de?subject=PSUI%20Content%20Elements',
        },
        {
          name: {
            de: 'LinkedIn',
            en: 'LinkedIn',
          },
          href: 'https://linkedin.com',
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
      de: 'Designt und entwickelt von <a href="https://peter-stuhlmann-webentwicklung.de">Peter R. Stuhlmann Webentwicklung</a>.',
      en: 'Designed and developed by <a href="https://peter-stuhlmann-webentwicklung.de">Peter R. Stuhlmann Web Development</a>.',
    },
  },
};

export default footerData;
