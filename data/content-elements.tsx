import Link from 'next/link';

import SubFooter from '@/components/content-elements/default/footer/sub-footer/component';
import Breadcrumbs from '@/components/content-elements/default/breadcrumbs/breadcrumbs';

import { Flex } from '@/components/Flex';
import Colors from '@/components/layout/colors';
import {
  Button,
  IntroText,
  Wrapper,
} from '@/components/content-elements/default';
import {
  ContentElement,
  Translation,
} from '@/app/[locale]/content-elements/[slug]/utils/getContentElement';
import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { ImageText } from '@/components/content-elements/default';

export type ContentElementsSection = {
  name: Translation;
  description?: Translation;
  elements?: ContentElement[];
};

const primaryColor = getPrimaryColor();

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
      elementProps: [
        {
          name: 'children',
          required: true,
          type: ['string', 'React.ReactNode'],
          description: {
            de: 'Button-Text',
            en: 'Button text',
          },
        },
        {
          name: 'className',
          type: ['string'],
          default: '.[prefix]-button',
          description: {
            de: 'CSS-Klasse für benutzerdefinierte Stile wird ergänzt.',
            en: 'Additional CSS class for custom styles.',
          },
        },
        {
          name: 'variant',
          type: ['"text"', '"contained"', '"outlined"'],
          default: '"outlined"',
          description: {
            de: 'Button-Stil',
            en: 'Button style',
          },
        },
        {
          name: 'fontWeight',
          type: ['400', '700'],
          default: '700',
          description: {
            de: 'Normal- oder Fettdruck',
            en: 'Button text',
          },
        },
        {
          name: 'size',
          type: ['"small"', '"medium"', '"large"'],
          default: '"medium"',
          description: {
            de: 'Buttongröße',
            en: 'Button size',
          },
        },
        {
          name: 'margin',
          type: ['"none"', '"small"', '"medium"', '"large"'],
          default: '"none"',
          description: {
            de: 'Vertikaler Abstand',
            en: 'Vertical spacing',
          },
        },
        {
          name: 'href',
          type: ['string'],
          description: {
            de: 'Link des Call-To-Action-Buttons',
            en: 'Link of the call-to-action button',
          },
        },
        {
          name: 'target',
          type: ['"_self"', '"_blank"', '"_parent"', '"_top"'],
          default: '"_self"',
          description: {
            de: 'Linkziel des Call-To-Action-Buttons',
            en: 'Link target of the call-to-action button',
          },
        },
        {
          name: 'onClick',
          type: ['React.MouseEventHandler<HTMLElement>'],
          description: {
            de: 'Funktion, die beim Klicken auf den Button aufgerufen wird',
            en: 'Function called when the button is clicked',
          },
        },
        {
          name: 'style',
          type: ['React.CSSProperties'],
          description: {
            de: 'Inline-CSS-Stile',
            en: 'Inline CSS styles',
          },
        },
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
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['100']}
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
      elementProps: [
        {
          name: 'children',
          type: ['string', 'React.ReactNode'],
          default: '""',
          description: {
            de: 'Text',
            en: 'Text',
          },
        },
        {
          name: 'className',
          type: ['string'],
          default: '.[prefix]-intro-text',
          description: {
            de: 'CSS-Klasse für benutzerdefinierte Stile wird ergänzt.',
            en: 'Additional CSS class for custom styles.',
          },
        },
        {
          name: 'heading',
          type: ['string', 'React.ReactNode'],
          default: '""',
          description: {
            de: 'Überschrift',
            en: 'Heading',
          },
        },
        {
          name: 'headingType',
          type: ['"h1"', '"h2"', '"h3"'],
          default: '"h1"',
          description: {
            de: 'Level der Überschrift',
            en: 'Heading level',
          },
        },
        {
          name: 'backgroundColor',
          type: ['string'],
          default: 'transparent',
          description: {
            de: 'Hintergrundfarbe',
            en: 'Background color',
          },
        },
        {
          name: 'textColor',
          type: ['string'],
          default: 'primaryColor["900"]',
          description: {
            de: 'Textfarbe',
            en: 'Text color',
          },
        },
        {
          name: 'ctaButton',
          type: [{ name: 'Button', href: '/content-elements/button' }],
          description: {
            de: 'Link des Call-To-Action-Buttons',
            en: 'Link of the call-to-action button',
          },
        },
        {
          name: 'margin',
          type: ['"none"', '"small"', '"medium"', '"large"'],
          default: '"small"',
          description: {
            de: 'Abstand zum nächsten Element',
            en: 'Spacing to the next element',
          },
        },
        {
          name: 'width',
          type: ['"small"', '"medium"', '"large"'],
          default: '"large"',
          description: {
            de: 'Gesamtbreite des Elements',
            en: 'Overall width of the element',
          },
        },
        {
          name: 'innerWidth',
          type: ['"small"', '"medium"', '"large"'],
          default: '"small"',
          description: {
            de: 'Wrapper-Breite des Elements',
            en: 'Wrapper width of the element',
          },
        },
        {
          name: 'align',
          type: ['"left"', '"center"', '"right"'],
          default: '"left"',
          description: {
            de: 'Inline-CSS-Stile',
            en: 'Inline CSS styles',
          },
        },
        {
          name: 'padding',
          type: ['"none"', '"small"', '"medium"', '"large"'],
          default: '"medium"',
          description: {
            de: 'Innenabstand des Elements',
            en: 'Inner padding of the element',
          },
        },
        {
          name: 'style',
          type: ['React.CSSProperties'],
          default: '{}',
          description: {
            de: 'Inline-CSS-Stile',
            en: 'Inline CSS styles',
          },
        },
      ],
    },
    {
      name: { de: 'Text mit Bild', en: 'Text with image' },
      description: {
        de: <></>,
        en: <></>,
      },
      slug: 'image-text',
      components: [
        <ImageText
          $imagePosition="left"
          image={{
            src: '/img/image-1.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading="Lorem ipsum"
          headingType="h2"
          subHeading="Lorem ipsum dolor sit amet"
          // ctaButton={{ children: 'Call-To-Action' }}
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
            et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </ImageText>,
        <ImageText
          $imagePosition="right"
          $backgroundColor={primaryColor['700']}
          $textColor={primaryColor['50']}
          image={{
            src: '/img/image-2.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading="Lorem ipsum"
          headingType="h2"
          subHeading="Lorem ipsum dolor sit amet"
          ctaButton={{
            children: 'Lorem ipsum',
            $textColor: primaryColor['50'],
          }}
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
            et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </ImageText>,
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
