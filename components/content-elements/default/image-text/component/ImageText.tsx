import { FC } from 'react';
import { ImageTextProps } from './ImageText.types';
import { Container } from './ImageText.styles';
import { getPrimaryColor } from '../../constants';
// import Heading from '../../core/heading';
import Button from '../../core/button';
import Spacer from '../../spacer';
import Image from '../../core/image';
// import Overline from '../../core/overline';
// import Subline from '../../core/subline';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';

import { LocalizedString, resolveLocalizedText } from '../../utils/i18n';

/**
 * Sehr einfache URL-Validierung, damit wir Image nur mit "halbwegs" brauchbaren
 * Werten füttern und new URL(...) im Core-Image nicht crasht.
 *
 * Erlaubt:
 *  - absolute http/https URLs
 *  - relative Pfade, die mit /, ./ oder ../ beginnen
 */
function isProbablyValidImageSrc(src: unknown): boolean {
  if (!src || typeof src !== 'string') return false;

  const trimmed = src.trim();
  if (!trimmed) return false;

  // Relative Pfade zulassen (z. B. "/uploads/foo.jpg")
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true;
  }

  // Einfache Prüfung für absolute http/https URLs
  if (/^https?:\/\//i.test(trimmed)) {
    return true;
  }

  // alles andere (wie "h", "foo", "xyz") erstmal ablehnen
  return false;
}

const ImageText: FC<ImageTextProps> = ({ data }) => {
  // data vom Mapper kommt jetzt schon mit currentLanguage
  const {
    children,
    image,
    ctaButton,
    imagePosition = 'right',
    textColor = getPrimaryColor()['950'],
    className = '',
    currentLanguage,
  } = (data ?? {}) as ImageTextProps['data'] & {
    currentLanguage?: string;
  };

  const lang = currentLanguage || DEFAULT_LANGUAGES[0];

  const resolvedAlt = resolveLocalizedText(
    (image?.alt as LocalizedString) ?? null,
    lang
  );
  const resolvedCaption = resolveLocalizedText(
    (image?.caption as LocalizedString) ?? null,
    lang
  );
  const resolvedCopyright = resolveLocalizedText(
    (image?.copyright as LocalizedString) ?? null,
    lang
  );

  // ✅ WICHTIG: funktioniert jetzt auch, wenn children = { value, element }
  const resolvedChildrenHtml: string = resolveLocalizedText(
    (children as LocalizedString) ?? null,
    lang
  );

  // Bild-URL nur verwenden, wenn sie halbwegs gültig aussieht
  const hasValidImageSrc =
    image && isProbablyValidImageSrc((image as { src?: string }).src);

  return (
    <Container
      className={className}
      $imagePosition={imagePosition}
      $textColor={textColor}
    >
      <div className="text">
        {/* {elementOverlineValue && <Overline value={elementOverlineValue} />}
        {elementHeadingValue && (
          <Heading
            element={elementHeadingElement || 'h2'}
            value={elementHeadingValue}
          />
        )}
        {elementSublineValue && <Subline value={elementSublineValue} />} */}

        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: resolvedChildrenHtml,
            }}
          />

          {ctaButton?.children && (
            <>
              <Spacer data={{ size: 's' }} />
              <Button
                href={ctaButton.href}
                target={ctaButton.target}
                {...ctaButton}
              >
                {ctaButton.children}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="image">
        {hasValidImageSrc ? (
          <Image
            src={(image as { src: string }).src}
            alt={resolvedAlt || ''}
            width={image.width ?? 693}
            height={image.height ?? 462}
            caption={resolvedCaption || ''}
            copyright={resolvedCopyright || ''}
          />
        ) : (
          <div />
        )}
      </div>
    </Container>
  );
};

export default ImageText;
