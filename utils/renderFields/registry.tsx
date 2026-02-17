'use client';

import React from 'react';
import TextInput from '@/components/blocks/TextInputBlock';
import SelectInput from '@/components/blocks/SelectInputBlock';
import ColorInput from '@/components/blocks/ColorInputBlock';
import MapField, { MapValue } from '@/components/blocks/MapInputBlock';
import SwitchInputBlock from '@/components/blocks/SwitchInputBlock';
import CheckboxInputBlock from '@/components/blocks/CheckboxInputBlock';
import RadioInputBlock from '@/components/blocks/RadioInputBlock';
import NumberInput from '@/components/content-elements/default/inputs/number-input';
import HtmlInputBlock from '@/components/blocks/HtmlInputBlock';
import SliderInput from '@/components/blocks/SliderInputBlock';
import LinkInputBlock, { LinkValue } from '@/components/blocks/LinkInputBlock';

import AccordionItemBlock, {
  AccordionItemValue,
} from '@/components/blocks/custom/AccordionItemBlock';
import FactItemBlock from '@/components/blocks/custom/FactItemBlock';
import TabMenuItemBlock, {
  TabmenuItemValue,
} from '@/components/blocks/custom/TabmenuItemBlock';
import CounterItemBlock, {
  CounterItemValue,
} from '@/components/blocks/custom/CounterItemBlock';
import CardBlock, {
  CardValue,
  SubtitleValue,
  TitleValue,
} from '@/components/content-elements/default/animated-cards/settings/block';

import type { FieldRenderProps, BaseFieldType, TranslatedValue } from './types';
import { fetchUrlSuggestions } from '../fetchUrlSuggestions';

import ListItemBlock, {
  ListItemValue,
} from '@/components/content-elements/default/list/settings/block';
import ImageInputBlock, {
  ImageValue,
} from '@/components/blocks/ImageInputBlock';

import MultiLanguageEditor from '@/components/blocks/editor/MultiLanguageEditor';
import ElementLayoutBlock, {
  ElementLayoutValue,
} from '@/components/blocks/element-layout/ElementLayout';

/* =========================================================================================
 * Helpers
 * =======================================================================================*/

type LocalizedString =
  | string
  | Record<string, string | undefined | null>
  | null
  | undefined;

type LocalizedFieldValueShape = {
  value?: LocalizedString;
  element?: string;
};

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

function withDefault(value: unknown, defaultValue: unknown): unknown {
  if (value == null) return defaultValue;
  if (typeof value === 'string' && value.trim() === '') return defaultValue;
  if (Array.isArray(value) && value.length === 0) return defaultValue;
  return value;
}

function coerceLocalizedFieldValue(input: unknown): LocalizedFieldValueShape {
  if (input == null) return { value: '' };

  if (typeof input === 'string') return { value: input };

  if (isPlainObject(input)) {
    const obj = input as Record<string, unknown>;
    const hasValue = Object.prototype.hasOwnProperty.call(obj, 'value');
    const hasElement = Object.prototype.hasOwnProperty.call(obj, 'element');

    if (hasValue || hasElement) {
      const value = obj.value as LocalizedString;
      const element =
        typeof obj.element === 'string' && obj.element.trim()
          ? obj.element.trim()
          : undefined;
      return { value, element };
    }

    // altes format {de,en,...} – in deinem NEU-only System kommt das ggf. trotzdem noch vor:
    // wir akzeptieren es als value-map
    return { value: input as LocalizedString };
  }

  return { value: String(input) };
}

function coerceString(input: unknown, fallback = ''): string {
  if (input == null) return fallback;
  if (typeof input === 'string') return input;
  if (typeof input === 'number' || typeof input === 'boolean')
    return String(input);
  return fallback;
}

/**
 * TextInputBlock kann string ODER TranslatedValue liefern.
 * Wir behandeln beides.
 */
type TextInputValue = string | TranslatedValue;

/* =========================================================================================
 * renderSingleField
 * =======================================================================================*/

export function renderSingleField(
  type: BaseFieldType,
  props: FieldRenderProps
): React.JSX.Element {
  const {
    label,
    value,
    onChange,
    options = [],
    min,
    max,
    step,
    rows,
    placeholder,
    workspaceId,
  } = props;

  const defaultValue = props.defaultValue;
  const effectiveValue = withDefault(value, defaultValue);

  switch (type) {
    case 'accordion-item': {
      const safe: AccordionItemValue =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as AccordionItemValue)
          : ({
              id: '',
              title: '' as any,
              content: '' as any,
            } as unknown as AccordionItemValue);

      return (
        <AccordionItemBlock
          label={label || 'Accordion-Item'}
          value={safe}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'animated-card': {
      const raw = (effectiveValue as Partial<CardValue>) || {};
      const normalized: Partial<CardValue> = { ...raw };

      if (typeof (raw as any).title === 'string') {
        normalized.title = {
          value: (raw as any).title,
        } as unknown as TitleValue;
      }
      if (typeof (raw as any).subtitle === 'string') {
        normalized.subtitle = {
          value: (raw as any).subtitle,
        } as unknown as SubtitleValue;
      }
      if (typeof (raw as any).href === 'string') {
        normalized.href = coerceLocalizedFieldValue((raw as any).href) as any;
      }

      const safe: CardValue = {
        title: {
          ...(normalized.title as any),
          value: (normalized.title as any)?.value ?? '',
        },
        subtitle: {
          ...(normalized.subtitle as any),
          value: (normalized.subtitle as any)?.value ?? '',
        },
        href: (normalized.href as any) ?? coerceLocalizedFieldValue(''),
        newTab: !!normalized.newTab,
        icon: normalized.icon ?? {
          name: null,
          small: { color: '', hoverColor: '' },
          large: { color: '', hoverColor: '' },
        },
        overlayColor: normalized.overlayColor ?? '',
        backgroundColor: normalized.backgroundColor ?? '',
        borderColor: normalized.borderColor ?? '',
        borderRadius: (normalized as any).borderRadius ?? 'none',
      };

      return (
        <CardBlock
          label={label || 'Card'}
          value={safe}
          onChange={(v) => onChange(v)}
          fetchUrlSuggestions={(q) => fetchUrlSuggestions(workspaceId || '', q)}
        />
      );
    }

    case 'counter-item': {
      const raw = effectiveValue as Partial<CounterItemValue> | undefined;

      const safe: CounterItemValue = {
        id: typeof raw?.id === 'string' ? raw.id : '',
        label: coerceString((raw as any)?.label, ''),
        animated: (raw as any)?.animated ?? true,
        startValue:
          (raw as any)?.startValue == null
            ? 0
            : Number((raw as any).startValue),
        endValue:
          (raw as any)?.endValue == null ? 100 : Number((raw as any).endValue),
        animationDuration:
          ((raw as any)?.animationDuration as string | undefined) ?? 'normal',
        prefixText: coerceString((raw as any)?.prefixText, ''),
        suffixText: coerceString((raw as any)?.suffixText, ''),
      };

      return (
        <CounterItemBlock
          label={label || 'Counter-Item'}
          value={safe}
          onChange={(v) => onChange(v)}
          durationOptions={
            options?.map((o) => ({ label: o.label, value: o.value })) ?? [
              { label: 'Schnell (0,6s)', value: 'fast' },
              { label: 'Normal (1,2s)', value: 'normal' },
              { label: 'Langsam (2s)', value: 'slow' },
            ]
          }
        />
      );
    }

    case 'rte-textarea': {
      return (
        <MultiLanguageEditor
          label={label}
          value={effectiveValue as unknown}
          onChange={(next) => onChange(next)}
        />
      );
    }

    case 'rte-text': {
      return (
        <MultiLanguageEditor
          label={label}
          singleLine={true}
          value={effectiveValue as unknown}
          onChange={(next) => onChange(next)}
        />
      );
    }

    case 'element-layout': {
      const safe: ElementLayoutValue | null =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as ElementLayoutValue)
          : null;

      const allowedKeys =
        props.config && Array.isArray(props.config.keys)
          ? (props.config.keys as string[])
          : undefined;

      return (
        <ElementLayoutBlock
          label={label || 'Element Layout'}
          value={safe}
          onChange={(next) => onChange(next)}
          allowedKeys={allowedKeys}
        />
      );
    }

    case 'fact-item': {
      const safe =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as { label: string; value: string })
          : { label: '', value: '' };

      return (
        <FactItemBlock
          label={label || 'Fakt'}
          value={safe}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'horizontal-line': {
      const safe =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as { label: string; value: string })
          : { label: '', value: '' };

      return (
        <FactItemBlock
          label={label || 'Fakt'}
          value={safe}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'image': {
      const safe: ImageValue =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as ImageValue)
          : {};

      return (
        <ImageInputBlock
          label={label || 'Bild'}
          value={safe}
          onChange={(next) => onChange(next)}
        />
      );
    }

    case 'list-item': {
      const safe: ListItemValue =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as ListItemValue)
          : ({
              icon: { name: '' },
              text: '',
            } as any);

      return (
        <ListItemBlock
          label={label || 'Listeneintrag'}
          value={safe}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'tabmenu-item': {
      const safe: TabmenuItemValue =
        effectiveValue && typeof effectiveValue === 'object'
          ? (effectiveValue as TabmenuItemValue)
          : ({ id: '', label: '', content: '' } as any);

      return (
        <TabMenuItemBlock
          label={label || 'Tab'}
          value={safe}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'select': {
      return (
        <SelectInput
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v: string) => onChange(v)}
          options={options.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
      );
    }

    case 'radio': {
      return (
        <RadioInputBlock
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v) => onChange(v)}
          options={options || []}
        />
      );
    }

    case 'color': {
      return (
        <ColorInput
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v: string) => onChange(v)}
        />
      );
    }

    case 'checkbox': {
      return (
        <CheckboxInputBlock
          label={label || ''}
          value={!!effectiveValue}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'switch': {
      return (
        <SwitchInputBlock
          label={label || ''}
          value={!!effectiveValue}
          onChange={(v: boolean) => onChange(v)}
        />
      );
    }

    case 'date': {
      // date ist bei dir wie text behandelt
      return (
        <TextInput
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v: TextInputValue) => onChange(v)}
        />
      );
    }

    case 'number': {
      const toNumberOrNull = (v: unknown): number | null => {
        if (v === '' || v == null) return null;
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isFinite(n) ? n : null;
      };

      return (
        <NumberInput
          label={label || ''}
          value={toNumberOrNull(effectiveValue)}
          onChange={(n) => onChange(n)}
          min={min}
          max={max}
          step={step}
        />
      );
    }

    case 'slider': {
      const startNum = typeof min === 'number' ? min : 0;
      const endNum = typeof max === 'number' ? max : 100;
      const stepNum = typeof step === 'number' ? step : 1;

      const numValue =
        typeof effectiveValue === 'number'
          ? effectiveValue
          : effectiveValue === '' || effectiveValue == null
          ? startNum
          : Number(effectiveValue);

      return (
        <SliderInput
          label={label || ''}
          start={startNum}
          end={endNum}
          steps={stepNum}
          value={Number.isFinite(numValue) ? numValue : startNum}
          onChange={(n: number) => onChange(n)}
        />
      );
    }

    case 'html': {
      return (
        <HtmlInputBlock
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v) => onChange(v)}
        />
      );
    }

    case 'link': {
      const safe = {
        label: coerceLocalizedFieldValue(
          isPlainObject(effectiveValue) ? (effectiveValue as any).label : ''
        ),
        href: coerceLocalizedFieldValue(
          isPlainObject(effectiveValue) ? (effectiveValue as any).href : ''
        ),
        newTab: !!(isPlainObject(effectiveValue)
          ? (effectiveValue as any).newTab
          : false),
      } as unknown as LinkValue;

      return (
        <LinkInputBlock
          label={label || ''}
          value={safe}
          onChange={(next) => onChange(next)}
          fetchUrlSuggestions={(q) => fetchUrlSuggestions(workspaceId || '', q)}
        />
      );
    }

    case 'map': {
      return (
        <div>
          {label ? (
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
          ) : null}
          <MapField
            value={effectiveValue as MapValue}
            onChange={(v) => onChange(v)}
          />
        </div>
      );
    }

    case 'video':
    case 'audio': {
      return (
        <TextInput
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v: TextInputValue) => onChange(v)}
        />
      );
    }

    case 'text':
    default: {
      return (
        <TextInput
          label={label || ''}
          value={(effectiveValue as string) ?? ''}
          onChange={(v: TextInputValue) => onChange(v)}
          rows={rows}
        />
      );
    }
  }
}
