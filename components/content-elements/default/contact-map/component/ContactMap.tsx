'use client';

import { FC, useMemo } from 'react';
import { ContactMapProps } from './ContactMap.types';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../constants';
import Button from '../../core/button';
import { Container } from '../../image-text/component/ImageText.styles';
import { IconLinks, ListItems } from './ContactMap.styles';
import Map from '../../core/map';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import type { LanguageCode } from '@/components/language-settings/languages';

/* =======================
   i18n helpers (NEW-only)
======================= */

type LocalizedHtml = Record<string, string>;
type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSingleLineElement(v: unknown): v is SingleLineElement {
  return (
    v === 'div' ||
    v === 'h1' ||
    v === 'h2' ||
    v === 'h3' ||
    v === 'h4' ||
    v === 'h5' ||
    v === 'h6'
  );
}

function isLocalizedHtml(v: unknown): v is LocalizedHtml {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

function isLocalizedFieldValue(v: unknown): v is LocalizedFieldValue {
  if (!isRecord(v)) return false;
  const value = (v as { value?: unknown }).value;
  const element = (v as { element?: unknown }).element;
  if (!isLocalizedHtml(value)) return false;
  if (!isSingleLineElement(element)) return false;
  return true;
}

function pickLocalizedForView(map: LocalizedHtml, lang: LanguageCode): string {
  const byLang = map[lang];
  if (typeof byLang === 'string' && byLang.trim()) return byLang;

  const de = map.de;
  if (typeof de === 'string' && de.trim()) return de;

  const first = Object.values(map).find(
    (v) => typeof v === 'string' && v.trim()
  );
  return first ?? '';
}

function resolveLocalizedStringNewOnly(
  input: unknown,
  lang: LanguageCode
): string {
  if (!isLocalizedFieldValue(input)) return '';
  return pickLocalizedForView(input.value, lang);
}

/**
 * Für RTE/HTML Inhalte (children, address.value) – NEW-only:
 * Wir liefern HTML-String zurück. Rendering passiert via dangerouslySetInnerHTML.
 */
function resolveLocalizedHtmlNewOnly(
  input: unknown,
  lang: LanguageCode
): string {
  if (!isLocalizedFieldValue(input)) return '';
  return pickLocalizedForView(input.value, lang);
}

/* =======================
   Component
======================= */

const ContactMap: FC<ContactMapProps> = ({ data, __instanceKey }) => {
  const {
    children,
    map = {
      center: { lat: 52.520876431051285, lng: 13.409427523605075 },
      zoom: 13,
      markers: [],
    },
    iconLinks = [],
    address = [],
    imagePosition = 'right',
    textColor = getPrimaryColor()['950'],
    currentLanguage,
  } = (data ?? {}) as ContactMapProps['data'] & {
    currentLanguage?: LanguageCode;
  };

  const lang: LanguageCode = currentLanguage ?? DEFAULT_LANGUAGES[0];
  const elementClassName = getElementClassName('contact-map');

  // children ist jetzt HTML (NEW-only LocalizedFieldValue)
  const childrenHtml = useMemo(() => {
    return resolveLocalizedHtmlNewOnly(children as unknown, lang);
  }, [children, lang]);

  return (
    <Container
      className={elementClassName}
      $imagePosition={imagePosition}
      $textColor={textColor}
    >
      <div className="text">
        <div>
          {/* children als HTML */}
          {childrenHtml ? (
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: childrenHtml }}
            />
          ) : null}

          {Array.isArray(address) && address.length > 0 && (
            <ListItems className={`${elementClassName}-list-items`}>
              {address.map((listItem: unknown, idx: number) => {
                const item = (listItem ?? {}) as {
                  label?: unknown; // NEW-only LocalizedFieldValue (plain)
                  value?: unknown; // NEW-only LocalizedFieldValue (HTML)
                };

                const labelText = resolveLocalizedStringNewOnly(
                  item.label,
                  lang
                );
                const valueHtml = resolveLocalizedHtmlNewOnly(item.value, lang);

                if (!labelText && !valueHtml) return null;

                return (
                  <div
                    key={`list-item-${idx}`}
                    className={`${elementClassName}-list-item`}
                  >
                    <span className={`${elementClassName}-list-item-label`}>
                      {labelText}
                    </span>{' '}
                    <span
                      className={`${elementClassName}-list-item-value`}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: valueHtml || '' }}
                    />
                  </div>
                );
              })}
            </ListItems>
          )}

          {Array.isArray(iconLinks) && iconLinks.length > 0 && (
            <IconLinks>
              {iconLinks.map((icon: unknown, idx: number) => {
                const it = (icon ?? {}) as {
                  label?: unknown; // NEW-only LocalizedFieldValue (plain)
                  href?: unknown; // NEW-only LocalizedFieldValue (plain)
                  newTab?: unknown;
                  variant?: unknown;
                  ariaLabel?: unknown;
                };

                const labelText = resolveLocalizedStringNewOnly(it.label, lang);
                const hrefText = resolveLocalizedStringNewOnly(it.href, lang);

                if (!labelText) return null;

                return (
                  <Button
                    key={`icon-${idx}`}
                    href={hrefText}
                    target={it.newTab ? '_blank' : '_self'}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    variant={(it.variant as any) || 'outlined'}
                    ariaLabel={
                      typeof it.ariaLabel === 'string'
                        ? it.ariaLabel
                        : undefined
                    }
                  >
                    {labelText}
                  </Button>
                );
              })}
            </IconLinks>
          )}
        </div>
      </div>

      {map && (
        <div className="image">
          {/* ⬅️ Remount der Karte bei Reorder erzwingen */}
          <Map
            key={`map-${__instanceKey ?? 'noid'}`}
            map={map}
            textColor={textColor}
          />
        </div>
      )}
    </Container>
  );
};

export default ContactMap;
