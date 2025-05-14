import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { FooterData } from '@/components/content-elements/default/footer/footer/component/Footer.types';

const footerData: FooterData = {
  backgroundColor: getPrimaryColor()['100'],
  title: {
    de: 'Peter R. Stuhlmann Webentwicklung</span>',
    en: 'Peter R. Stuhlmann Web Devlopment</span>',
  },
  nav: [
    {
      title: {
        de: 'Weitere meiner Websites',
        en: 'Other websites of mine',
      },
      links: [
        {
          name: {
            de: 'peter-stuhlmann.de',
            en: 'peter-stuhlmann.de',
          },
          href: 'https://peter-stuhlmann.de',
        },
        {
          name: {
            de: 'peter-stuhlmann-fotografie.de',
            en: 'peter-stuhlmann-fotografie.de',
          },
          href: 'https://peter-stuhlmann-fotografie.de',
        },
        {
          name: {
            de: 'kalender.lol',
            en: 'kalender.lol',
          },
          href: 'https://kalender.lol',
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
            de: 'E-Mail',
            en: 'Email',
          },
          href: 'mailto:info@peter-stuhlmann.de?subject=Kontakt%20Webentwicklung',
        },
        {
          name: {
            de: 'LinkedIn',
            en: 'LinkedIn',
          },
          href: 'https://linkedin.com/in/peter-stuhlmann',
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
