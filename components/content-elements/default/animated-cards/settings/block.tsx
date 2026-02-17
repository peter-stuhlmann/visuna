'use client';

import React, { FC, useMemo } from 'react';
import { BlockWrapper } from '@/components/blocks/BlockWrapper.styles';
import { IconProps } from '@/components/content-elements/default';
import SwitchInput from '@/components/content-elements/default/inputs/switch-input';
import LinkInputBlock, {
  type LinkValue,
  type UrlSuggestion,
} from '@/components/blocks/LinkInputBlock';
import ColorInput from '@/components/blocks/ColorInputBlock';
import BlockGrid from '@/components/blocks/block-styles/grid/Grid';
import SelectInput from '../../inputs/select-input';
import IconBlock from '@/components/blocks/IconBlock';
import MultiLanguageEditor from '@/components/blocks/editor/MultiLanguageEditor';

/* ---------- Typen ---------- */

// ✅ Neuer Wertetyp für singleLine MultiLanguageEditor
type LocalizedHtml = Record<string, string>;
type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

export type TitleValue = {
  value: LocalizedFieldValue;
  color?: string;
  hoverColor?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'normal' | 'uppercase';
};

export type SubtitleValue = {
  value: LocalizedFieldValue;
  color?: string;
  hoverColor?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'normal' | 'uppercase';
};

type IconColorState = {
  color?: string;
  hoverColor?: string;
};

type IconState = {
  name?: IconProps['name'] | null;
  small: IconColorState;
  large: IconColorState;
};

export type CardValue = {
  title: TitleValue;
  subtitle: SubtitleValue;

  // ✅ war string -> jetzt NEW-only localized (plain text)
  href: LocalizedFieldValue;

  newTab: boolean;

  icon: IconState;

  overlayColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
};

type CardBlockProps = {
  label: string;
  value: CardValue | null | undefined;
  onChange: (next: CardValue) => void;
  fetchUrlSuggestions?: (query: string) => Promise<UrlSuggestion[]>;
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

function normalizeLocalizedFieldValue(input: unknown): LocalizedFieldValue {
  // ✅ NEW-only: { value: {de,en,...}, element: "..." }
  if (isRecord(input)) {
    const rawValue = (input as { value?: unknown }).value;
    const rawElement = (input as { element?: unknown }).element;

    const value: LocalizedHtml = {};
    if (isRecord(rawValue)) {
      for (const [k, v] of Object.entries(rawValue)) {
        if (typeof v === 'string') value[k] = v;
      }
    }

    const element: SingleLineElement = isSingleLineElement(rawElement)
      ? rawElement
      : 'div';

    return { value, element };
  }

  return { value: {}, element: 'div' };
}

const CardBlock: FC<CardBlockProps> = ({
  label,
  value,
  onChange,
  fetchUrlSuggestions,
}) => {
  const safe = useMemo<CardValue>(() => {
    const v = (value ?? {}) as Partial<CardValue>;
    const ttl = (v.title ?? {}) as Partial<TitleValue>;
    const sub = (v.subtitle ?? {}) as Partial<SubtitleValue>;
    const icn = (v.icon ?? {}) as Partial<IconState>;
    const small = (icn.small ?? {}) as Partial<IconColorState>;
    const large = (icn.large ?? {}) as Partial<IconColorState>;

    return {
      title: {
        value: normalizeLocalizedFieldValue(ttl.value),
        color: typeof ttl.color === 'string' ? ttl.color : '',
        hoverColor: typeof ttl.hoverColor === 'string' ? ttl.hoverColor : '',
        align: (ttl.align as TitleValue['align']) ?? 'center',
        transform: (ttl.transform as TitleValue['transform']) ?? 'normal',
      },
      subtitle: {
        value: normalizeLocalizedFieldValue(sub.value),
        color: typeof sub.color === 'string' ? sub.color : '',
        hoverColor: typeof sub.hoverColor === 'string' ? sub.hoverColor : '',
        align: (sub.align as SubtitleValue['align']) ?? 'center',
        transform: (sub.transform as SubtitleValue['transform']) ?? 'normal',
      },

      // ✅ href jetzt auch localized
      href: normalizeLocalizedFieldValue(v.href),

      newTab: !!v.newTab,

      icon: {
        name: (icn.name as IconProps['name'] | null) ?? null,
        small: {
          color: typeof small.color === 'string' ? small.color : '',
          hoverColor:
            typeof small.hoverColor === 'string' ? small.hoverColor : '',
        },
        large: {
          color: typeof large.color === 'string' ? large.color : '',
          hoverColor:
            typeof large.hoverColor === 'string' ? large.hoverColor : '',
        },
      },

      overlayColor: typeof v.overlayColor === 'string' ? v.overlayColor : '',
      backgroundColor:
        typeof v.backgroundColor === 'string' ? v.backgroundColor : '',
      borderColor: typeof v.borderColor === 'string' ? v.borderColor : '',
      borderRadius: typeof v.borderRadius === 'string' ? v.borderRadius : '',
    };
  }, [value]);

  const patch = (partial: Partial<CardValue>) =>
    onChange({ ...safe, ...partial });

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      {/* KARTE */}
      <BlockGrid
        title="Karte"
        layout={{
          columns: { base: 1, sm: 2, md: 3, lg: 4 },
          fullAt: {},
        }}
      >
        <ColorInput
          label="Hintergrund-Farbe"
          value={safe.backgroundColor ?? ''}
          onChange={(val: string) => patch({ backgroundColor: val })}
        />

        <ColorInput
          label="Overlay-Farbe"
          value={safe.overlayColor ?? ''}
          onChange={(val: string) => patch({ overlayColor: val })}
        />

        <ColorInput
          label="Border-Farbe"
          value={safe.borderColor ?? ''}
          onChange={(val: string) => patch({ borderColor: val })}
        />

        <SelectInput
          label="Eckenrundung"
          value={(safe.borderRadius ?? 'none') as string}
          onChange={(e) => patch({ borderRadius: e.target.value as string })}
          options={[
            { value: 'none', label: 'Keine' },
            { value: 's', label: 'Klein' },
            { value: 'm', label: 'Mittel' },
            { value: 'l', label: 'Groß' },
            { value: 'xl', label: 'Extra Groß' },
            { value: 'full', label: 'Rund' },
          ]}
        />
      </BlockGrid>

      {/* TITEL */}
      <BlockGrid
        title="Titel"
        layout={{
          columns: { base: 1, sm: 2, md: 3, lg: 4 },
          fullAt: { base: [1], sm: [1], md: [1], lg: [1] },
        }}
      >
        <MultiLanguageEditor
          label="Titel"
          singleLine
          value={safe.title.value}
          onChange={(next) =>
            patch({
              title: {
                ...safe.title,
                value: next as unknown as LocalizedFieldValue,
              },
            })
          }
        />

        <ColorInput
          label="Titelfarbe"
          value={safe.title.color ?? ''}
          onChange={(val: string) =>
            patch({ title: { ...safe.title, color: val } })
          }
        />

        <ColorInput
          label="Titelfarbe (Hover)"
          value={safe.title.hoverColor ?? ''}
          onChange={(val: string) =>
            patch({ title: { ...safe.title, hoverColor: val } })
          }
        />

        <SelectInput
          label="Ausrichtung"
          value={(safe.title.align ?? 'center') as string}
          onChange={(e) =>
            patch({
              title: {
                ...safe.title,
                align: e.target.value as 'left' | 'center' | 'right',
              },
            })
          }
          options={[
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Mittig' },
            { value: 'right', label: 'Rechts' },
          ]}
        />

        <SelectInput
          label="Schreibweise"
          value={(safe.title.transform ?? 'normal') as string}
          onChange={(e) =>
            patch({
              title: {
                ...safe.title,
                transform: e.target.value as 'normal' | 'uppercase',
              },
            })
          }
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'uppercase', label: 'Großbuchstaben' },
          ]}
        />
      </BlockGrid>

      {/* UNTERTITEL */}
      <BlockGrid
        title="Untertitel"
        layout={{
          columns: { base: 1, sm: 2, md: 3, lg: 4 },
          fullAt: { base: [1], sm: [1], md: [1], lg: [1] },
        }}
      >
        <MultiLanguageEditor
          label="Untertitel"
          singleLine
          value={safe.subtitle.value}
          onChange={(next) =>
            patch({
              subtitle: {
                ...safe.subtitle,
                value: next as unknown as LocalizedFieldValue,
              },
            })
          }
        />

        <ColorInput
          label="Textfarbe"
          value={safe.subtitle.color ?? ''}
          onChange={(val: string) =>
            patch({ subtitle: { ...safe.subtitle, color: val } })
          }
        />

        <ColorInput
          label="Textfarbe (Hover)"
          value={safe.subtitle.hoverColor ?? ''}
          onChange={(val: string) =>
            patch({ subtitle: { ...safe.subtitle, hoverColor: val } })
          }
        />

        <SelectInput
          label="Ausrichtung"
          value={(safe.subtitle.align ?? 'center') as string}
          onChange={(e) =>
            patch({
              subtitle: {
                ...safe.subtitle,
                align: e.target.value as 'left' | 'center' | 'right',
              },
            })
          }
          options={[
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Mittig' },
            { value: 'right', label: 'Rechts' },
          ]}
        />

        <SelectInput
          label="Schreibweise"
          value={(safe.subtitle.transform ?? 'normal') as string}
          onChange={(e) =>
            patch({
              subtitle: {
                ...safe.subtitle,
                transform: e.target.value as 'normal' | 'uppercase',
              },
            })
          }
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'uppercase', label: 'Großbuchstaben' },
          ]}
        />
      </BlockGrid>

      {/* ICON */}
      <BlockGrid
        title="Icon"
        layout={{
          columns: { base: 1, sm: 2, md: 3, lg: 4 },
          fullAt: { base: [1], sm: [1], md: [1], lg: [1] },
        }}
      >
        <IconBlock
          label="Icon"
          icons={['PiGearBold', 'TbBolt', 'MdHome']}
          value={safe.icon.name ?? null}
          onChange={(name) => patch({ icon: { ...safe.icon, name } })}
        />

        <ColorInput
          label="Farbe Großes Icon"
          value={safe.icon.large.color ?? ''}
          onChange={(val: string) =>
            patch({
              icon: { ...safe.icon, large: { ...safe.icon.large, color: val } },
            })
          }
        />

        <ColorInput
          label="Farbe Großes Icon (Hover)"
          value={safe.icon.large.hoverColor ?? ''}
          onChange={(val: string) =>
            patch({
              icon: {
                ...safe.icon,
                large: { ...safe.icon.large, hoverColor: val },
              },
            })
          }
        />

        <ColorInput
          label="Farbe Kleines Icon"
          value={safe.icon.small.color ?? ''}
          onChange={(val: string) =>
            patch({
              icon: { ...safe.icon, small: { ...safe.icon.small, color: val } },
            })
          }
        />

        <ColorInput
          label="Farbe Kleines Icon (Hover)"
          value={safe.icon.small.hoverColor ?? ''}
          onChange={(val: string) =>
            patch({
              icon: {
                ...safe.icon,
                small: { ...safe.icon.small, hoverColor: val },
              },
            })
          }
        />
      </BlockGrid>

      {/* LINK (NEW-only) */}
      <LinkInputBlock
        label="Link"
        value={{
          // ✅ NEW-only: LocalizedFieldValue
          label: safe.title.value, // wenn du Link-Text = Titel willst
          href: safe.href, // ✅ jetzt LocalizedFieldValue
          newTab: safe.newTab,
          highlighted: false,
        }}
        onChange={(next: LinkValue) =>
          patch({
            href: next.href, // ✅ LocalizedFieldValue
            newTab: !!next.newTab,
            // optional, falls du Link-Text speichern willst:
            // title: { ...safe.title, value: next.label },
          })
        }
        fetchUrlSuggestions={fetchUrlSuggestions}
      />

      <div>
        <SwitchInput
          label="In neuem Tab öffnen"
          checked={safe.newTab}
          onChange={(checked) => patch({ newTab: checked })}
        />
      </div>
    </BlockWrapper>
  );
};

export default CardBlock;
