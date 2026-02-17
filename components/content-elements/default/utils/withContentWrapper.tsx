import React, { ComponentType, FC } from 'react';
import Wrapper from '../core/wrapper';
import Heading from '../core/heading';
import Overline from '../core/overline';
import Subline from '../core/subline';
import Spacer from '../spacer';
import getElementClassName from './getElementClassName';
import { PageElementData } from '../types';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import { DEFAULT_LAYOUT } from '../core/wrapper/component/Wrapper.defaults';

import { resolveLocalizedText } from './i18n';

type WithDataWrapperProps = {
  data?: PageElementData;
};

type LocalizedString =
  | string
  | Record<string, string | undefined | null>
  | null
  | undefined;

type TopTextField = {
  value?: LocalizedString;
  element?: string;
};

function pickLanguageFromData(data: PageElementData): string {
  const anyData = data as unknown as {
    currentLanguage?: string;
    language?: string;
    lang?: string;
  };

  return (
    anyData.currentLanguage ||
    anyData.language ||
    anyData.lang ||
    DEFAULT_LANGUAGES[0] ||
    'de'
  );
}

/**
 * ✅ Abwärtskompatibel:
 * - wenn field ein string oder {de,en,...} ist -> { value: field }
 * - wenn field ein object mit { value, element } ist -> so lassen (sanitizen)
 */
function coerceTopTextField(field: unknown): TopTextField | null {
  if (field == null) return null;

  // Neu: { value, element }
  if (typeof field === 'object' && !Array.isArray(field)) {
    const obj = field as Record<string, unknown>;

    // "Neu" erkennen: hat value oder element
    const hasValueKey = Object.prototype.hasOwnProperty.call(obj, 'value');
    const hasElementKey = Object.prototype.hasOwnProperty.call(obj, 'element');

    if (hasValueKey || hasElementKey) {
      const value = obj.value as LocalizedString;
      const element =
        typeof obj.element === 'string' && obj.element.trim()
          ? obj.element.trim()
          : undefined;

      return { value, element };
    }

    // Alt: { de: "...", en: "..." }
    return { value: field as LocalizedString };
  }

  // Alt: "..."
  if (typeof field === 'string') return { value: field };

  return null;
}

/**
 * ✅ Nur für Spacer/Rendering-Entscheidung:
 * prüft ob ein LocalizedString überhaupt "Content" hat
 */
function hasAnyText(value: LocalizedString): boolean {
  if (!value) return false;

  if (typeof value === 'string') return value.trim().length > 0;

  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      if (typeof v === 'string' && v.trim().length > 0) return true;
    }
  }

  return false;
}

export function withContentElementWrapper<P extends object>(
  Component: ComponentType<P>,
  baseClassName?: string
): FC<P & WithDataWrapperProps> {
  const WrappedComponent: FC<P & WithDataWrapperProps> = (props) => {
    const { data: rawData, ...rest } = props;

    const data: PageElementData = rawData ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unwrapped = (data as any).layout?.unwrapped ?? false;

    const elementClassName = baseClassName
      ? getElementClassName(baseClassName)
      : '';

    // ✅ eine Quelle der Wahrheit
    const currentLanguage = pickLanguageFromData(data);

    // ✅ wir injizieren currentLanguage in data, damit ALLE Children es bekommen
    const dataWithLanguage: PageElementData & { currentLanguage: string } = {
      ...(data as PageElementData),
      currentLanguage,
    };

    // ✅ NEU: introContent als Field (Localized String)
    // fallback auf elementIntroContent, falls introContent leer ist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const introContent = (dataWithLanguage as any).introContent || (dataWithLanguage as any).elementIntroContent;

    // Helper um den lokalisierten String zu holen
    const introHtml = resolveLocalizedText(introContent, currentLanguage);
    const hasIntro = !!introHtml;

    const content = (
      <>
        {hasIntro && (
          <div 
            className="intro-content rte-content"
            dangerouslySetInnerHTML={{ __html: introHtml }} 
          />
        )}

        {hasIntro && <Spacer data={{ size: 'l' }} />}

        <Component
          {...(rest as P)}
          data={dataWithLanguage}
          className={`${elementClassName}`}
        />
      </>
    );

    if (unwrapped) return content;

    return (
      <Wrapper
        className={`${elementClassName}-wrapper`}
        data={{
          ...dataWithLanguage,
          layout: dataWithLanguage.layout ?? DEFAULT_LAYOUT,
          children: content,
        }}
      />
    );
  };

  WrappedComponent.displayName = `WithContentElementWrapper(${
    Component.displayName || Component.name || 'Anonymous'
  })`;

  return WrappedComponent;
}
