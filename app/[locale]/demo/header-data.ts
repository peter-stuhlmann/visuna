import { SimpleHeaderData } from '@/components/content-elements/default/header/simple-header/component/SimpleHeader.types';

const headerData: SimpleHeaderData = {
  logo: {
    src: '/img/visuna-logo.svg',
    alt: 'Logo',
    width: 120,
    height: 26,
  },
  navItems: [
    { label: { de: 'Über mich', en: 'About' }, href: '#' },
    { label: { de: 'Leistungen', en: 'Services' }, href: '#' },
    { label: { de: 'Angebot anfordern', en: 'Request a quote' }, href: '#' },
    { label: { de: 'Blog', en: 'Blog' }, href: '#' },
  ],
};

export default headerData;
