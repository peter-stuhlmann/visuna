// tools/getElementDefaults.ts
//
// Liest die settings.ts jedes Content-Elements und extrahiert
// ein flaches Default-Objekt mit allen { key: default } Paaren.

type FieldDef = {
  key?: string;
  default?: unknown;
  fields?: FieldDef[];
};

type SettingsGroup = {
  name?: string;
  fields?: FieldDef[];
};

/**
 * Rekursiv alle { key, default } aus der verschachtelten Settings-Struktur extrahieren.
 */
function extractDefaults(
  groups: readonly SettingsGroup[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function walk(items: readonly FieldDef[]) {
    for (const item of items) {
      if (item.key && item.default !== undefined) {
        result[item.key] = item.default;
      }
      if (item.fields) {
        walk(item.fields);
      }
    }
  }

  for (const group of groups) {
    if (group.fields) {
      walk(group.fields);
    }
  }

  return result;
}

// ── Statischer Import aller Settings ──────────────────────────

import { settings as accordionSettings } from '@/components/content-elements/default/accordion/settings/settings';
import { settings as animatedCardsSettings } from '@/components/content-elements/default/animated-cards/settings/settings';
import { settings as breadcrumbsSettings } from '@/components/content-elements/default/breadcrumbs/settings/settings';
import { settings as cardsGridSettings } from '@/components/content-elements/default/cards-grid/settings/settings';
import { settings as contactMapSettings } from '@/components/content-elements/default/contact-map/settings/settings';
import { settings as horizontalLineSettings } from '@/components/content-elements/default/horizontal-line/settings/settings';
import { settings as imageTextSettings } from '@/components/content-elements/default/image-text/settings/settings';
import { settings as introTextSettings } from '@/components/content-elements/default/intro-text/settings/settings';
import { settings as largeCardSettings } from '@/components/content-elements/default/large-card/settings/settings';
import { settings as listSettings } from '@/components/content-elements/default/list/settings/settings';
import { settings as logoGridSettings } from '@/components/content-elements/default/logo-grid/settings/settings';
import { settings as metricsSettings } from '@/components/content-elements/default/metrics/settings/settings';
import { settings as sliderSettings } from '@/components/content-elements/default/slider/settings/settings';
import { settings as spacerSettings } from '@/components/content-elements/default/spacer/settings/settings';
import { settings as subFooterSettings } from '@/components/content-elements/default/sub-footer/settings/settings';
import { settings as tabMenuSettings } from '@/components/content-elements/default/tab-menu/settings/settings';
import { settings as videoHeroSettings } from '@/components/content-elements/default/video-hero/settings/settings';
import { settings as watermarkSettings } from '@/components/content-elements/default/watermark/settings/settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const settingsMap: Record<string, any> = {
  'accordion': accordionSettings,
  'animated-cards': animatedCardsSettings,
  'breadcrumbs': breadcrumbsSettings,
  'cards-grid': cardsGridSettings,
  'contact-map': contactMapSettings,
  'horizontal-line': horizontalLineSettings,
  'image-text': imageTextSettings,
  'intro-text': introTextSettings,
  'large-card': largeCardSettings,
  'list': listSettings,
  'logo-grid': logoGridSettings,
  'metrics': metricsSettings,
  'slider': sliderSettings,
  'spacer': spacerSettings,
  'sub-footer': subFooterSettings,
  'tab-menu': tabMenuSettings,
  'video-hero': videoHeroSettings,
  'watermark': watermarkSettings,
};

/**
 * Gibt das Default-Data-Objekt für einen Element-Typ zurück.
 * Falls kein Settings-File existiert, wird ein leeres Objekt zurückgegeben.
 */
export function getElementDefaults(elementType: string): Record<string, unknown> {
  const settings = settingsMap[elementType];
  if (!settings) return {};
  return extractDefaults(settings);
}
