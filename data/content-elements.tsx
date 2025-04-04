import Link from 'next/link';

import SubFooter from '@/components/content-elements/footer/sub-footer';
import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';
import {
  ContentElement,
  Translation,
} from '@/components/content-elements/types';
import Wrapper from '@/components/wrapper';

export type ContentElementsSection = {
  name: Translation;
  description?: Translation;
  elements?: ContentElement[];
};

const navigationElements: ContentElementsSection = {
  name: { de: 'Navigationselemente', en: 'Navigation elements' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Breadcrumbs', en: 'Breadcrumbs' },
      description: {
        de: (
          <>
            <p>
              Dieses Content-Element ist eine praktische Navigation, die der
              Besucherin oder dem Besucher Deiner Website immer Orientierung
              gibt. Breadcrumbs zeigen in einer klaren Hierarchie den Weg von
              der Startseite bis zur aktuellen Seite und ermöglichen so ein
              einfaches Zurückspringen zu übergeordneten Bereichen.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Breadcrumbs are a practical navigation tool that always gives you
              an overview of your current location on the website. They display
              the path from the homepage to your current page in a clear
              hierarchy, allowing you to easily jump back to higher-level
              sections. This saves you time and keeps you well-oriented—ideal
              when navigating complex websites or extensive content areas.
            </p>
          </>
        ),
      },
      slug: 'breadcrumbs',
      components: [
        <Wrapper>
          <Breadcrumbs
            links={[
              { label: 'Home', title: 'Go to Home', href: '#' },
              { label: 'Products', title: 'Go to Products page', href: '#' },
              {
                label: 'Product 1',
                title: 'You are currently on Product 1',
                href: null,
                isActive: true,
              },
            ]}
          />
        </Wrapper>,
      ],
    },
  ],
};

const footerElements: ContentElementsSection = {
  name: { de: 'Footerelemente', en: 'Footer elements' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'SubFooter', en: 'Sub footer' },
      description: {
        de: (
          <>
            <p>
              Dieses Content-Element ist ein einfacher Container, der Text
              zentriert, links- oder rechtsbündig darstellt.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              This content element is a simple container that displays text
              centered, left-aligned or right-aligned.
            </p>
          </>
        ),
      },
      slug: 'subfooter',
      components: [
        <SubFooter>
          Copyright by John Doe. Visit{' '}
          <Link
            href="https://example.com"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: 'rgb(209, 0, 105)' }}
          >
            example.com
          </Link>
        </SubFooter>,
      ],
    },
  ],
};

// Arrays kombinieren
export const contentElementsSections: ContentElementsSection[] = [
  navigationElements,
  footerElements,
];

export default contentElementsSections;
