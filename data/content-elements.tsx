import Link from 'next/link';

import SubFooter from '@/components/content-elements/footer/sub-footer';
import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';
import {
  ContentElement,
  Translation,
} from '@/components/content-elements/types';
import Wrapper from '@/components/wrapper';
import Button from '@/components/content-elements/text/button';
import { Flex } from '@/components/Flex';
import IntroText from '@/components/content-elements/text/intro-text';
import { PRIMARY_COLOR } from '@/components/content-elements/content-elements.config';
import Colors from '@/components/content-elements/layout/colors';

export type ContentElementsSection = {
  name: Translation;
  description?: Translation;
  elements?: ContentElement[];
};

const textElements: ContentElementsSection = {
  name: { de: 'Text-Elemente', en: 'Text elements' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Button', en: 'Button' },
      description: {
        de: <></>,
        en: <></>,
      },
      slug: 'button',
      components: [
        <Wrapper>
          <Flex $gap="1rem" $justifyContent="center">
            <Button variant="text">text</Button>
            <Button variant="contained">contained</Button>
            <Button variant="outlined">outlined</Button>
          </Flex>
        </Wrapper>,
      ],
    },
    {
      name: { de: 'Intro-Text', en: 'Intro text' },
      description: {
        de: <></>,
        en: <></>,
      },
      slug: 'intro-text',
      components: [
        <IntroText
          heading="Lorem ipsum"
          ctaButton={{ children: 'Call-To-Action' }}
          align="center"
          backgroundColor={PRIMARY_COLOR['700']}
          textColor={PRIMARY_COLOR['100']}
          padding="large"
          margin="none"
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. <b>Stet clita kasd gubergren</b>, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </p>
          <p>
            At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet. <b>Lorem ipsum dolor sit amet</b>, consetetur sadipscing
            elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
            magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet,
            consetetur sadipscing elitr, <b>sed diam nonumy eirmod</b> tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          </p>
        </IntroText>,
      ],
    },
  ],
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

const core: ContentElementsSection = {
  name: { de: 'Core', en: 'Core' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Farben', en: 'Colors' },
      description: {
        de: (
          <>
            <p>
              Ein Theme ist mit diesen Standard-Farbnamen einfach anpassbar, es
              können auch eigene Farben mit selbst definierten Farbwerten
              konfiguriert werden.
            </p>
            <p>
              Die Elemente des Core-Themes enthalten bereits Farbabstufungen. Es
              muss also nur global der Farbname geändert werden.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              A theme can be easily customized using these standard color names,
              and you can also configure your own colors with custom values.
            </p>
            <p>
              The elements of the core theme already include color shades, so
              you only need to change the color name globally.
            </p>
          </>
        ),
      },
      slug: 'colors',
      components: [<Colors />],
    },
  ],
};

// Arrays kombinieren
export const contentElementsSections: ContentElementsSection[] = [
  textElements,
  navigationElements,
  footerElements,
  core,
];

export default contentElementsSections;
