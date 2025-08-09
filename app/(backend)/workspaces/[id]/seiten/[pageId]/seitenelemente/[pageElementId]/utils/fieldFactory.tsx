'use client';

import TextInput from '../../../../../../../../../components/blocks/TextBlock';
import SelectInput from '../../../../../../../../../components/blocks/SelectInputBlock';
import {
  FieldTypeMap,
  Width,
} from '@/components/content-elements/default/types';
import ColorInputBlock from '@/components/blocks/ColorInput';
import MapField, { MapValue } from '@/components/blocks/MapField';
import AddressInput, {
  AddressInputItem,
} from '@/components/content-elements/default/contact/contact-map/settings/AddressInput';

type FieldComponentProps<T> = {
  name: string;
  value: T;
  onChange: (value: T) => void;
};

export const fieldRegistry: {
  [K in keyof FieldTypeMap]: (
    props: FieldComponentProps<FieldTypeMap[K]>
  ) => React.JSX.Element;
} = {
  backgroundColor: ({ value, onChange }) => (
    <ColorInputBlock
      label="Hintergrundfarbe"
      value={value as string}
      onChange={onChange}
    />
  ),
  borderRadius: ({ value, onChange }) => (
    <SelectInput
      label="Äußere Ecken"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Keine', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
        { label: 'Maximal', value: 'full' },
      ]}
    />
  ),
  children: ({ value, onChange }) => (
    <TextInput
      label="Hauptinhalt"
      rows={4}
      value={value as string}
      onChange={onChange}
    />
  ),
  className: ({ value, onChange }) => (
    <TextInput label="CSS-Klasse" value={value as string} onChange={onChange} />
  ),
  element: ({ value, onChange }) => (
    <SelectInput
      label="HTML-Element"
      value={value as string}
      onChange={onChange}
      options={[
        { label: 'section', value: 'section' },
        { label: 'div', value: 'div' },
        { label: 'header', value: 'header' },
        { label: 'footer', value: 'footer' },
      ]}
    />
  ),
  elementSublineValue: ({ value, onChange }) => (
    <TextInput
      label="Unterüberschrift (Element)"
      value={value as string}
      onChange={onChange}
    />
  ),
  elementHeadingValue: ({ value, onChange }) => (
    <TextInput
      label="Überschrift (Element)"
      value={value as string}
      onChange={onChange}
    />
  ),
  elementOverlineValue: ({ value, onChange }) => (
    <TextInput
      label="Überline (Element)"
      value={value as string}
      onChange={onChange}
    />
  ),
  heading: ({ value, onChange }) => (
    <SelectInput
      label="Heading"
      value={value as string}
      onChange={onChange}
      options={[
        { label: 'section', value: 'section' },
        { label: 'div', value: 'div' },
        { label: 'header', value: 'header' },
        { label: 'footer', value: 'footer' },
      ]}
    />
  ),
  headingTextColor: ({ value, onChange }) => (
    <ColorInputBlock
      label="Überschrift Textfarbe"
      value={value as string}
      onChange={onChange}
    />
  ),
  headingValue: ({ value, onChange }) => (
    <TextInput
      label="Überschrift"
      value={value as string}
      onChange={onChange}
    />
  ),
  innerBorderRadius: ({ value, onChange }) => (
    <SelectInput
      label="Innere Ecken"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Keine', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
        { label: 'Maximal', value: 'full' },
      ]}
    />
  ),
  innerWidth: ({ value, onChange }) => (
    <SelectInput
      label="Innere maximale Breite"
      value={value as Width}
      onChange={(val) => onChange(val as Width)}
      options={[
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
        { label: 'Volle Breite', value: 'full' },
      ]}
    />
  ),
  address: ({ value, onChange }) => (
    <AddressInput
      value={(value as AddressInputItem[]) ?? ([] as AddressInputItem[])}
      onChange={onChange}
    />
  ),
  map: ({ value, onChange }) => (
    <MapField value={value as MapValue} onChange={onChange} />
  ),
  marginBottom: ({ value, onChange }) => (
    <SelectInput
      label="Außenabstand unten"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  marginLeft: ({ value, onChange }) => (
    <SelectInput
      label="Außenabstand links"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  marginRight: ({ value, onChange }) => (
    <SelectInput
      label="Außenabstand rechts"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  marginTop: ({ value, onChange }) => (
    <SelectInput
      label="Außenabstand oben"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  overlineValue: ({ value, onChange }) => (
    <TextInput label="Überline" value={value as string} onChange={onChange} />
  ),
  paddingBottom: ({ value, onChange }) => (
    <SelectInput
      label="Innenabstand unten"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  paddingLeft: ({ value, onChange }) => (
    <SelectInput
      label="Innenabstand links"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  paddingRight: ({ value, onChange }) => (
    <SelectInput
      label="Innenabstand rechts"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  paddingTop: ({ value, onChange }) => (
    <SelectInput
      label="Innenabstand oben"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Kein', value: 'none' },
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  size: ({ value, onChange }) => (
    <SelectInput
      label="Größe"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
      ]}
    />
  ),
  sublineValue: ({ value, onChange }) => (
    <TextInput
      label="Unterüberschrift"
      value={value as string}
      onChange={onChange}
    />
  ),
  textAlign: ({ value, onChange }) => (
    <SelectInput
      label="Ausrichtung"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Links', value: 'left' },
        { label: 'Zentriert', value: 'center' },
        { label: 'Rechts', value: 'right' },
        { label: 'Blocksatz', value: 'justify' },
      ]}
    />
  ),
  textTransform: ({ value, onChange }) => (
    <SelectInput
      label="Texttransformierung"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Normal', value: 'none' },
        { label: 'Großbuchstaben', value: 'uppercase' },
        { label: 'Kleinbuchstaben', value: 'lowercase' },
      ]}
    />
  ),
  value: ({ value, onChange }) => (
    <TextInput label="Wert" value={value as string} onChange={onChange} />
  ),
  width: ({ value, onChange }) => (
    <SelectInput
      label="Innere maximale Breite"
      value={value as string}
      onChange={onChange as (value: string) => void}
      options={[
        { label: 'Sehr klein', value: 's' },
        { label: 'Klein', value: 'm' },
        { label: 'Mittel', value: 'l' },
        { label: 'Groß', value: 'xl' },
        { label: 'Sehr groß', value: 'xxl' },
        { label: 'Volle Breite', value: 'full' },
      ]}
    />
  ),
};
