type TemplateTypes = {
  id: string;
  name: { [locale: string]: string };
  description: { [locale: string]: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any[];
};

export const sampleTemplates: TemplateTypes[] = [
  {
    id: 'blank',
    name: { de: 'Blank', en: 'Blank' },
    description: {
      de: 'Starte mit einer leeren Seite.',
      en: 'Start with a blank page.',
    },
    elements: [],
  },
    {
    id: 'starter',
    name: { de: 'Starter', en: 'Starter' },
    description: {
      de: 'Starte mit einem Starter-Layout.',
      en: 'Start with a starter layout.',
    },
    elements: [
      {
        element: 'breadcrumbs',
        data: {
          links: [
            { label: 'Startseite', href: '/' },
            { label: 'Unterseite', href: '/sub' },
          ],
          textColor: '#374151',
          linkTextColor: '#374151',
          highlightedTextColor: '#111827',
          dividerColor: '#e5e7eb',
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            outerBackgroundColor: '#ffffffff',
            innerBackgroundColor: 'rgba(255, 255, 255, 0)',
            outerBorderRadius: 'none',
            innerBorderRadius: 'm',
            outerMarginTop: 'none',
            outerMarginBottom: 'none',
            outerPaddingTop: 's',
            outerPaddingRight: 's',
            outerPaddingBottom: 's',
            outerPaddingLeft: 's',
            innerPaddingTop: 'm',
            innerPaddingRight: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
          },
        },
      },
      {
        element: 'image-text',
        data: {
          introContent: {
            value: {
              de: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              en: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              es: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              fr: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              ru: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              tr: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              pt: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              it: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
              zh: '<p style="text-align: center;"><strong>LOREM IPSUM DOLOR SIT AMET</strong></p>',
            },
          },
          children: {
            value: {
              de: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              en: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              es: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              fr: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              ru: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              tr: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              pt: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              it: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
              zh: '<p style="text-align: left;"><span style="color: rgb(125, 150, 7);"><strong>Consetetur sadipscing</strong></span></p><h2 style="text-align: left;">Lorem ipsum dolor sit amet</h2><p style="text-align: left;">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><p style="text-align: left;">Sed diam nonumy eirmod tempor invidunt ut labore.</p>',
            },
          },
          image: {
            src: '/img/image-2.png',
            alt: {
              de: 'Lorem ipsum dolor sit amet',
              en: 'Lorem ipsum dolor sit amet',
              es: 'Lorem ipsum dolor sit amet',
              fr: 'Lorem ipsum dolor sit amet',
              ru: 'Lorem ipsum dolor sit amet',
              tr: 'Lorem ipsum dolor sit amet',
              pt: 'Lorem ipsum dolor sit amet',
              it: 'Lorem ipsum dolor sit amet',
              zh: 'Lorem ipsum dolor sit amet',
            },
            width: 800,
            height: 600,
            caption: {
              de: 'Lorem ipsum dolor sit amet',
              en: 'Lorem ipsum dolor sit amet',
              es: 'Lorem ipsum dolor sit amet',
              fr: 'Lorem ipsum dolor sit amet',
              ru: 'Lorem ipsum dolor sit amet',
              tr: 'Lorem ipsum dolor sit amet',
              pt: 'Lorem ipsum dolor sit amet',
              it: 'Lorem ipsum dolor sit amet',
              zh: 'Lorem ipsum dolor sit amet',
            },
            copyright: {
              de: 'Foto: Lorem ipsum dolor sit amet',
              en: 'Photo: Lorem ipsum dolor sit amet',
              es: 'Foto: Lorem ipsum dolor sit amet',
              fr: 'Photo: Lorem ipsum dolor sit amet',
              ru: 'Фото: Lorem ipsum dolor sit amet',
              tr: 'Fotoğraf: Lorem ipsum dolor sit amet',
              pt: 'Foto: Lorem ipsum dolor sit amet',
              it: 'Foto: Lorem ipsum dolor sit amet',
              zh: '照片: Lorem ipsum dolor sit amet',
            },
          },
          imagePosition: 'right',
          textColor: '#111827',
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            outerBackgroundColor: '#ffffffff',
            innerBackgroundColor: 'rgba(255, 255, 255, 0)',
            outerBorderRadius: 'none',
            innerBorderRadius: 'm',
            outerMarginTop: 'none',
            outerMarginBottom: 'none',
            outerPaddingTop: 's',
            outerPaddingRight: 's',
            outerPaddingBottom: 's',
            outerPaddingLeft: 's',
            innerPaddingTop: 'm',
            innerPaddingRight: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
          },
        },
      },
    ],
  },
  {
    id: 'blog-post',
    name: { de: 'Blog-Beitrag', en: 'Blog Post' },
    description: {
      de: 'Ein einfaches Blog-Post-Layout mit Titel, Bild und Inhalt.',
      en: 'A simple blog post layout with title, image, and content.',
    },
    elements: [
      {
        element: 'image-text',
        data: {
          introContent: {
            value: { de: 'Blog Post Title' },
            element: 'h1',
          },
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            outerBackgroundColor: '#ffffffff',
            innerBackgroundColor: 'rgba(255, 255, 255, 0)',
            outerBorderRadius: 'none',
            innerBorderRadius: 'none',
            outerMarginTop: 'none',
            outerMarginBottom: 'none',
            outerPaddingTop: 's',
            outerPaddingRight: 's',
            outerPaddingBottom: 's',
            outerPaddingLeft: 's',
            innerPaddingTop: 'm',
            innerPaddingRight: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
          },
        },
      },
    ],
  },
];
