'use client';

import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import TextInput from '../../../inputs/text';
import Button from '../../../button/button';
import { BlockWrapper } from '@/components/blocks/BlockWrapper.styles';

export type AddressInputItem = { label: string; value: string };

type Props = {
  value: AddressInputItem[];
  onChange: (value: AddressInputItem[]) => void;
};

export default function AddressInput({ value, onChange }: Props) {
  const [items, setItems] = useState<AddressInputItem[]>([]);

  useEffect(() => {
    const lastItem = value[value.length - 1];
    const hasEmptyItem = lastItem?.label === '' && lastItem?.value === '';

    if (!hasEmptyItem) {
      setItems([...value, { label: '', value: '' }]);
    } else {
      setItems([...value]);
    }
  }, [value]);

  const updateItem = (
    index: number,
    field: keyof AddressInputItem,
    newValue: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = newValue;

    const isLast = index === items.length - 1;
    const isFilled =
      newItems[index].label !== '' || newItems[index].value !== '';

    if (isLast && isFilled) {
      newItems.push({ label: '', value: '' });
    }

    setItems(newItems);

    // Nur die ausgefüllten Items weitergeben
    const withoutEmptyLast =
      newItems[newItems.length - 1].label === '' &&
      newItems[newItems.length - 1].value === ''
        ? newItems.slice(0, -1)
        : newItems;

    onChange(withoutEmptyLast);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.filter((item) => item.label || item.value));
  };

  return (
    <BlockWrapper>
      <div>Adressdaten</div>
      <ul className="multi-input-container">
        {items.map((item, i) => (
          <li key={i} className="multi-input-row">
            <TextInput
              label="Label (z.B. Straße)"
              value={item.label}
              onChange={(value) => updateItem(i, 'label', value)}
            />
            <TextInput
              label="Wert (z.B. Hauptstraße 1)"
              value={item.value}
              onChange={(value) => updateItem(i, 'value', value)}
            />
            <div className="multi-input-actions">
              {!(item.label === '' && item.value === '') &&
                i !== items.length - 1 && (
                  <Button onClick={() => removeItem(i)}>
                    <FiTrash2 size={18} />
                  </Button>
                )}
            </div>
          </li>
        ))}
      </ul>
    </BlockWrapper>
  );
}
