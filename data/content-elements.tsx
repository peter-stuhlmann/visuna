import Link from 'next/link';
import {
  AiFillFacebook,
  AiFillGithub,
  AiFillInstagram,
  AiFillLinkedin,
} from 'react-icons/ai';

import SubFooter from '@/components/content-elements/default/footer/sub-footer/component';
import Breadcrumbs from '@/components/content-elements/default/breadcrumbs/breadcrumbs';

import { Flex } from '@/components/Flex';
import Colors from '@/components/layout/colors';
import {
  Button,
  ContactMap,
  IntroText,
  LargeCard,
  List,
  Wrapper,
} from '@/components/content-elements/default';
import {
  ContentElement,
  Translation,
} from '@/app/[locale]/content-elements/[slug]/utils/getContentElement';
import { getPrimaryColor } from '@/components/content-elements/default/constants';
import {
  Slider,
  Metrics,
  Accordion,
  ImageText,
} from '@/components/content-elements/default';
import colors from '@/components/content-elements/default/constants/colors';

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
        de: '',
        en: '',
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
        de: '',
        en: '',
      },
      slug: 'intro-text',
      components: [
        <IntroText
          elementHeading={{ value: 'Lorem ipsum', element: 'h2' }}
          ctaButton={{ children: 'Call-To-Action' }}
          align="center"
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['100']}
          padding="l"
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
    {
      name: { de: 'Text mit Bild', en: 'Text with image' },
      description: {
        de: '',
        en: '',
      },
      slug: 'image-text',
      components: [
        <ImageText
          imagePosition="left"
          image={{
            src: '/img/image-1.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading={{ value: 'Lorem ipsum', element: 'h2' }}
          overline={{ value: 'Lorem ipsum dolor sit amet' }}
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
          imagePosition="right"
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['50']}
          image={{
            src: '/img/image-2.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading={{ value: 'Lorem ipsum', element: 'h2' }}
          overline={{ value: 'Lorem ipsum dolor sit amet' }}
          ctaButton={{
            children: 'Lorem ipsum',
            textColor: primaryColor['50'],
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
              hierarchy, allowing you to easily jump back to higher-element
              sections. This saves you time and keeps you well-oriented—ideal
              when navigating complex websites or extensive content areas.
            </p>
          </>
        ),
      },
      slug: 'breadcrumbs',
      components: [
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
        />,
      ],
    },
  ],
};

const cardsElements: ContentElementsSection = {
  name: { de: 'Cards', en: 'Cards' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Große Card', en: 'Large Card' },
      description: {
        de: '',
        en: '',
      },
      slug: 'large-card',
      components: [
        <LargeCard
          backgroundImage={{
            src: '/img/image-2.png',
            alt: 'Image 2',
          }}
        >
          <h3>
            <span>Lorem ipsum</span>
          </h3>
          <p>
            <span>Lorem ipsum dolor sit amet.</span>
          </p>
          <List
            items={[
              { text: 'Lorem ipsum dolor sit amet' },
              { text: 'Lorem ipsum dolor sit amet, consetetur sadipscing' },
              { text: 'Lorem ipsum dolor sit amet, consetetur' },
              { text: 'Lorem ipsum dolor sit amet', icon: 'MdClear' },
            ]}
            defaultIcon={'MdCheck'}
            defaultIconColor={colors.GREEN['500']}
          />
        </LargeCard>,
      ],
    },
  ],
};

const sliderElements: ContentElementsSection = {
  name: { de: 'Sliderelemente', en: 'Slider elements' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Slider', en: 'Slider' },
      description: {
        de: '',
        en: '',
      },
      slug: 'slider',
      components: [
        <Slider
          id="slider-1"
          slideDuration={7000}
          backgroundColor={primaryColor['0']}
          slides={[
            {
              backgroundVideo: {
                src: '/test-3.mp4',
                type: 'video/mp4',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-4.mp4',
                type: 'video/mp4',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundImage: {
                src: '/img/image-1.png',
                alt: 'Image 1',
              },
              content: (
                <div>
                  <h3>Lorem ipsum dolor sit amet</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren.
                  </p>
                </div>
              ),
            },
            {
              backgroundImage: {
                src: '/img/image-2.png',
                alt: 'Image 2',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>

                    <h3 style={{ marginTop: '2rem' }}>
                      Lorem ipsum dolor sit amet
                    </h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-1.mp4',
                type: 'video/mp4',
              },
              ctaButton: [
                {
                  children: 'Lorem ipsum',
                  href: '#',
                  variant: 'outlined',
                  textColor: primaryColor['50'],
                },
              ],
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-2.mp4',
                type: 'video/mp4',
              },
              ctaButton: [
                {
                  children: 'Lorem ipsum',
                  href: '#',
                  variant: 'outlined',
                  textColor: primaryColor['50'],
                },
                {
                  children: 'Eirmod',
                  href: '#',
                  variant: 'contained',
                  primaryColor: primaryColor,
                  textColor: primaryColor['50'],
                },
                {
                  children: 'Justo duo',
                  href: '#',
                  variant: 'contained',
                  primaryColor: colors.EMERALD,
                  textColor: primaryColor['50'],
                },
              ],
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
          ]}
        />,
        <Slider
          id="slider-2"
          slideDuration={7000}
          backgroundColor={primaryColor['700']}
          $outline="light"
          slides={[
            {
              backgroundVideo: {
                src: '/test-3.mp4',
                type: 'video/mp4',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-4.mp4',
                type: 'video/mp4',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundImage: {
                src: '/img/image-1.png',
                alt: 'Image 1',
              },
              content: (
                <div>
                  <h3>Lorem ipsum dolor sit amet</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren.
                  </p>
                </div>
              ),
            },
            {
              backgroundImage: {
                src: '/img/image-2.png',
                alt: 'Image 2',
              },
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>

                    <h3 style={{ marginTop: '2rem' }}>
                      Lorem ipsum dolor sit amet
                    </h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-1.mp4',
                type: 'video/mp4',
              },
              ctaButton: [
                {
                  children: 'Lorem ipsum',
                  href: '#',
                  variant: 'outlined',
                  textColor: primaryColor['50'],
                },
              ],
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
            {
              backgroundVideo: {
                src: '/test-2.mp4',
                type: 'video/mp4',
              },
              ctaButton: [
                {
                  children: 'Lorem ipsum',
                  href: '#',
                  variant: 'outlined',
                  textColor: primaryColor['50'],
                },
                {
                  children: 'Eirmod',
                  href: '#',
                  variant: 'contained',
                  primaryColor: primaryColor,
                  textColor: primaryColor['50'],
                },
                {
                  children: 'Justo duo',
                  href: '#',
                  variant: 'contained',
                  primaryColor: colors.EMERALD,
                  textColor: primaryColor['50'],
                },
              ],
              content: (
                <>
                  <div>
                    <h3>Lorem ipsum dolor sit amet</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </p>
                  </div>
                </>
              ),
            },
          ]}
        />,
      ],
    },
  ],
};

const listElements: ContentElementsSection = {
  name: { de: 'Listen', en: 'Lists' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Liste', en: 'List' },
      description: {
        de: '',
        en: '',
      },
      slug: 'list',
      components: [
        <List
          items={[
            {
              text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            { text: 'Lorem ipsum dolor sit amet.' },
            { text: 'Lorem ipsum dolor sit amet.' },
          ]}
        />,
        <List
          items={[
            {
              text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            { text: 'Lorem ipsum dolor sit amet.' },
            { text: 'Lorem ipsum dolor sit amet.' },
          ]}
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['50']}
          defaultIconColor={primaryColor['50']}
        />,
        <List
          items={[
            {
              text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            { text: 'Lorem ipsum dolor sit amet.' },
            {
              text: 'Lorem ipsum dolor sit amet.',
              icon: 'MdClear',
              iconColor: colors.RED[500],
            },
          ]}
          defaultIcon={'MdCheck'}
          defaultIconColor={colors.GREEN['500']}
        />,
        <List
          items={[
            {
              text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            { text: 'Lorem ipsum dolor sit amet.' },
            {
              text: 'Lorem ipsum dolor sit amet.',
              icon: 'MdClear',
              iconColor: colors.RED[500],
            },
          ]}
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['50']}
          defaultIcon={'MdCheck'}
          defaultIconColor={colors.GREEN['500']}
        />,
      ],
    },
    {
      name: { de: 'Akkordion', en: 'Accordion' },
      description: {
        de: '',
        en: '',
      },
      slug: 'accordion',
      components: [
        <Accordion
          items={[
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
          ]}
        />,
        <Accordion
          items={[
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
          ]}
          textColor={primaryColor['950']}
          backgroundColor={primaryColor['700']}
        />,
        <Accordion
          items={[
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
          ]}
          initialOpenIndex={0}
        />,
        <Accordion
          items={[
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
            {
              title: 'Lorem ipsum dolor sit amet.',
              content:
                'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            },
          ]}
          initialOpenIndex={0}
          textColor={primaryColor['950']}
          backgroundColor={primaryColor['700']}
        />,
      ],
    },
  ],
};

const contactElements: ContentElementsSection = {
  name: { de: 'Kontakt-Bereiche', en: 'Contact sections' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Kontakt mit Karte', en: 'Contact with map' },
      description: {
        de: '',
        en: '',
      },
      slug: 'contact-map',
      components: [
        <ContactMap
          imagePosition="right"
          image={{
            src: '/img/image-2.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading={{ value: 'Contact us', element: 'h2' }}
          overline={{ value: 'Lorem ipsum dolor sit amet' }}
          map={{
            center: [52.52, 13.405],
            zoom: 10,
            markers: [
              {
                position: [52.52, 13.405],
                popup: {
                  content: 'Lorem ipsum dolor sit amet',
                },
              },
            ],
          }}
          listItems={[
            {
              label: 'Phone:',
              value:
                '<a href="tel:+49 (0) 1234 5678910">+49 (0) 1234 5678910</a>',
            },
            {
              label: 'Fax:',
              value: '+49 (0) 1234 5678911',
            },
            {
              label: 'Email:',
              value:
                '<a href="mailto:contact@example.com">contact@example.com</a>',
            },
            {
              label: 'Website:',
              value: '<a href="https://example.com">www.example.com</a>',
            },
          ]}
          iconLinks={[
            {
              icon: <AiFillLinkedin aria-hidden="true" />,
              href: 'https://linkedin.com',
              ariaLabel: 'LinkedIn',
            },
            {
              icon: <AiFillGithub aria-hidden="true" />,
              href: 'https://github.com',
              ariaLabel: 'Github',
            },
            {
              icon: <AiFillInstagram aria-hidden="true" />,
              href: 'https://instagram.com',
              ariaLabel: 'Instagram',
            },
            {
              icon: <AiFillFacebook aria-hidden="true" />,
              href: 'https://facebook.com',
              ariaLabel: 'Facebook',
            },
          ]}
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua.
          </p>
        </ContactMap>,
        <ContactMap
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['50']}
          imagePosition="right"
          image={{
            src: '/img/image-2.png',
            alt: 'Intro image',
            width: 693,
            height: 462,
          }}
          heading={{ value: 'Contact us', element: 'h2' }}
          overline={{ value: 'Lorem ipsum dolor sit amet' }}
          map={{
            center: [52.52, 13.405],
            zoom: 10,
            markers: [
              {
                position: [52.52, 13.405],
                popup: {
                  content: 'Lorem ipsum dolor sit amet',
                },
              },
            ],
          }}
          listItems={[
            {
              label: 'Phone:',
              value:
                '<a href="tel:+49 (0) 1234 5678910">+49 (0) 1234 5678910</a>',
            },
            {
              label: 'Fax:',
              value: '+49 (0) 1234 5678911',
            },
            {
              label: 'Email:',
              value:
                '<a href="mailto:contact@example.com">contact@example.com</a>',
            },
            {
              label: 'Website:',
              value: '<a href="https://example.com">www.example.com</a>',
            },
          ]}
          iconLinks={[
            {
              icon: <AiFillLinkedin aria-hidden="true" />,
              href: 'https://linkedin.com',
              ariaLabel: 'LinkedIn',
            },
            {
              icon: <AiFillGithub aria-hidden="true" />,
              href: 'https://github.com',
              ariaLabel: 'Github',
            },
            {
              icon: <AiFillInstagram aria-hidden="true" />,
              href: 'https://instagram.com',
              ariaLabel: 'Instagram',
            },
            {
              icon: <AiFillFacebook aria-hidden="true" />,
              href: 'https://facebook.com',
              ariaLabel: 'Facebook',
            },
          ]}
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua.
          </p>
        </ContactMap>,
      ],
    },
  ],
};

const metrcisElements: ContentElementsSection = {
  name: { de: 'Metricselemente', en: 'Metrics elements' },
  // description: { de: 'Description', en: 'Description' },
  elements: [
    {
      name: { de: 'Metrics', en: 'Metrics' },
      description: {
        de: '',
        en: '',
      },
      slug: 'metrics',
      components: [
        <Metrics
          data={[
            {
              value: 30,
              label: 'Lorem ipsum dolor sit amet',
            },
            {
              value: 100,
              label: 'Lorem ipsum dolor sit amet',
            },
            {
              value: 45,
              label: 'Lorem ipsum dolor sit amet',
            },
          ]}
        />,
        <Metrics
          backgroundColor={primaryColor['700']}
          textColor={primaryColor['50']}
          data={[
            {
              value: 30,
              label: 'Lorem ipsum dolor sit amet',
            },
            {
              value: 100,
              label: 'Lorem ipsum dolor sit amet',
            },
            {
              value: 45,
              label: 'Lorem ipsum dolor sit amet',
            },
          ]}
        />,
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
  cardsElements,
  sliderElements,
  listElements,
  contactElements,
  metrcisElements,
  footerElements,
  core,
];

export default contentElementsSections;
