import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { FooterData } from '@/components/content-elements/default/footer/footer/component/Footer.types';

const footerData: FooterData = {
  backgroundColor: getPrimaryColor()['700'],
  textColor: getPrimaryColor()['50'],
  title: {
    de: '&#091;<span>PS</span><span>UI</span>&#093;<span>Content Elemente</span>',
    en: '&#091;<span>PS</span><span>UI</span>&#093;<span>Content Elements</span>',
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
            de: 'Content-Elemente',
            en: 'Content Elements',
          },
          href: 'content-elements',
        },
        {
          name: {
            de: 'Github',
            en: 'Github',
          },
          href: 'https://github.com',
        },
        {
          name: {
            de: 'Demo-Projekt',
            en: 'Demo Project',
          },
          href: 'demo',
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
