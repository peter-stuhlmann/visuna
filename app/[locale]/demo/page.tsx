import { FC } from 'react';

import { getPrimaryColor } from '@/components/content-elements/default/constants';
import {
  ContactMap,
  ImageText,
  LargeCard,
  List,
  LogoGrid,
  Metrics,
  VideoHero,
  Slider,
} from '@/components/content-elements/default';
import colors from '@/components/content-elements/default/constants/colors';
import { AiFillGithub, AiFillInstagram, AiFillLinkedin } from 'react-icons/ai';

const DemoPage: FC = async () => {
  const primaryColor = getPrimaryColor();

  return (
    <main>
      <VideoHero
        overlayOpacity={0}
        innerWidth="full"
        innerBorderRadius="none"
        padding="none"
        overline={{ value: 'Ich erstelle Deine Website!' }}
        heading={{ value: 'Ich erstelle Deine Website!' }}
        videos={{
          s: {
            src: '/test-1.mp4',
          },
          m: {
            src: '/test-9.mp4',
          },
          l: {
            src: '/test-9.mp4',
          },
        }}
      />

      <ImageText
        imagePosition="left"
        image={{
          src: '/img/peter-stuhlmann.webp',
          alt: 'Das bin ich.',
          width: 1920,
          height: 1080,
        }}
        heading={{ value: 'Peter R. Stuhlmann', element: 'h2' }}
        overline={{ value: 'Webentwickler aus Berlin' }}
        ctaButton={{ children: 'Lebenslauf (PDF)' }}
        marginTop="l"
      >
        <p>
          Ich bin Peter, 29 Jahre alt und wohne in Berlin. Seit 2016 bin ich
          selbstständig und seit 2022 zudem bei team neusta, einer der größten
          Agenturen für Webentwicklung in Deutschland, angestellt.
        </p>
      </ImageText>

      <Metrics
        marginTop="none"
        marginBottom="none"
        data={[
          {
            value: 9,
            label: 'Jahre Praxiserfahrung',
          },
          {
            value: 80,
            label: 'zufriedene Kunden',
          },
          {
            value: 130,
            label: 'umgesetzte Projekte',
          },
        ]}
      />

      <LargeCard
        id={'large-card-1'}
        marginBottom="l"
        backgroundImage={{
          src: '/img/image-3.png',
          alt: 'Image 3',
        }}
        elementHeading={{
          value: 'Services',
          element: 'h2',
          align: 'center',
        }}
        elementSubline={{
          value:
            'Was eine Website in 2025 bieten sollte und was ich Dir bieten kann:',
          align: 'center',
        }}
        highlightColor={primaryColor['100']}
      >
        <h3>
          <span>Lorem ipsum</span>
        </h3>
        <p>
          <span>Lorem ipsum dolor sit amet.</span>
        </p>
        <List
          items={[
            {
              text: 'Optimierung für gängige Screen- und Mobile-Devices',
            },
            {
              text: 'Entwicklung barrierefreier Websites',
            },
            { text: 'Suchmaschinenoptimierung (SEO)' },
            { text: 'Lorem ipsum dolor sit amet' },
            { text: 'Lorem ipsum dolor sit amet, consetetur sadipscing' },
          ]}
          defaultIcon={'MdCheck'}
          defaultIconColor={colors.GREEN['500']}
          unwrapped
          padding="none"
        />
      </LargeCard>

      <ImageText
        imagePosition="right"
        image={{
          src: '/img/computer.jpg',
          alt: 'Aufgeklappes Notebook',
          width: 1280,
          height: 852,
        }}
        heading={{ value: 'Angebot anfordern!', element: 'h2' }}
        overline={{ value: 'Deine neue Website von mir entwickelt!' }}
        ctaButton={{ children: 'Zum Angebotskalkulator' }}
        backgroundColor={primaryColor['100']}
        width="full"
        marginBottom="l"
      >
        <p>
          Im Angebotskalkulator werden alle wichtigen Informationen abgefragt,
          die für eine unverbindliche Angebotserstellung benötigt werden.
        </p>
      </ImageText>

      <Slider
        id="slider-1"
        slideDuration={7000}
        $outline="light"
        innerWidth="full"
        padding="none"
        marginTop="l"
        elementHeading={{ value: 'Portfolio', element: 'h2', align: 'center' }}
        elementSubline={{
          value: 'Einige meiner bisher umgesetzten Projekte',
          align: 'center',
        }}
        slides={[
          {
            backgroundImage: {
              src: '/img/image-5.png',
              alt: 'Image 5',
            },
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#fff',
            $textColor: primaryColor['950'],
            content: (
              <>
                <div>
                  <h3>
                    <span>INNUH</span>
                  </h3>
                  <p>
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </span>
                  </p>
                </div>
              </>
            ),
          },
          {
            backgroundVideo: {
              src: '/test-3.mp4',
              type: 'video/mp4',
            },
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#fff',
            $textColor: primaryColor['950'],
            content: (
              <>
                <div>
                  <h3>
                    <span>Hebammenpraxis Sophieneck</span>
                  </h3>
                  <p>
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </span>
                  </p>
                </div>
              </>
            ),
          },
          {
            backgroundImage: {
              src: '/img/image-6.png',
              alt: 'Image 6',
            },
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#fff',
            content: (
              <div>
                <h3>
                  <span>
                    Förderverein &quot;Freunde des Goethe-Gymnasiums Nauen
                    e.V.&quot;
                  </span>
                </h3>
                <p>
                  <span>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren.
                  </span>
                </p>
              </div>
            ),
          },
          {
            backgroundImage: {
              src: '/img/image-5.png',
              alt: 'Image 2',
            },
            ctaButton: [
              {
                children: 'Weitere Informationen',
                href: '#',
                variant: 'contained',
                textColor: primaryColor['950'],
              },
            ],
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#fff',
            $textColor: primaryColor['950'],
            content: (
              <>
                <div>
                  <h3>
                    <span>Seenvision & Palü Trade</span>
                  </h3>
                  <p>
                    <span>
                      Für einen Kunden habe ich zwei Websites erstellt, die sich
                      ein Design teilen.
                    </span>
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
                variant: 'contained',
                textColor: primaryColor['50'],
              },
            ],
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#fff',
            $textColor: primaryColor['950'],
            content: (
              <>
                <div>
                  <h3>
                    <span>Peter R. Stuhlmann Fotografie-Portfolio</span>
                  </h3>
                  <p>
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </span>
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
                variant: 'contained',
                textColor: primaryColor['50'],
              },
            ],
            isHighlighted: true,
            $highlightedTextBackgroundColor: '#3b3723',
            $textColor: primaryColor['50'],
            content: (
              <>
                <div>
                  <h3>
                    <span>Kalender.lol</span>
                  </h3>
                  <p>
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                      sed diam nonumy eirmod tempor invidunt ut labore et dolore
                      magna aliquyam erat, sed diam voluptua. At vero eos et
                      accusam et justo duo dolores et ea rebum. Stet clita kasd
                      gubergren.
                    </span>
                  </p>
                </div>
              </>
            ),
          },
        ]}
      />

      <LogoGrid
        id="logo-grid-1"
        innerWidth="l"
        elementHeading={{ element: 'h2', value: 'Tech Stack', align: 'center' }}
        elementSubline={{
          value:
            'Mit den folgenden Tools bzw. Programmiersprachen und Frameworks setze ich Projekte um.',
          align: 'center',
        }}
        items={[
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/next.png',
              alt: 'Next.js',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/wordpress.png',
              alt: 'Wordpress',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/html.png',
              alt: 'HTML',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/css.png',
              alt: 'CSS',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/sass.png',
              alt: 'Logo 1',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/typescript.png',
              alt: 'SCSS',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/react.png',
              alt: 'React',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/git.png',
              alt: 'Git',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/github.png',
              alt: 'Github',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/styled-components.png',
              alt: 'Styled Components',
              // width: 138,
              height: 75,
            },
          },
          {
            image: {
              src: 'https://webdev-portfolio-api.vercel.app/img/material-ui.png',
              alt: 'Material UI',
              // width: 138,
              height: 75,
            },
          },
        ]}
      />

      <ContactMap
        imagePosition="right"
        marginTop="l"
        marginBottom="l"
        image={{
          src: '/img/image-2.png',
          alt: 'Intro image',
          width: 693,
          height: 462,
        }}
        heading={{ value: 'Kontakt', element: 'h2' }}
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
            label: 'Email:',
            value:
              '<a href="mailto:info@peter-stuhlmann.de">info@peter-stuhlmann.de</a>',
          },
          {
            label: 'Website:',
            value:
              '<a href="https://peter-stuhlmann-webentwicklung.de">peter-stuhlmann-webentwicklung.de</a>',
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
            href: 'https://instagram.com/peter.stuhlmann',
            ariaLabel: 'Instagram',
          },
        ]}
      >
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua.
        </p>
      </ContactMap>
    </main>
  );
};

export default DemoPage;
