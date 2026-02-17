'use client';

import React from 'react';
import RepeatableFieldList from './RepeatableFieldList';
import { renderSingleField } from './registry';
import { splitArrayType } from './objectUtils';
import type { AnyFieldType, BaseFieldType, FieldRenderProps } from './types';

export type { AnyFieldType, BaseFieldType, FieldRenderProps } from './types';

/** Öffentliche API: rendert Single- oder Array-Feld */
export function renderField(
  type: AnyFieldType,
  props: FieldRenderProps
): React.JSX.Element {
  const { base, isArray } = splitArrayType(type);

  if (!isArray) {
    return renderSingleField(base as BaseFieldType, props);
  }

  const arr = Array.isArray(props.value) ? (props.value as any[]) : [];
  const safeName = props.name ?? 'field'; // ✅ fix: Repeatable braucht string

  return (
    <RepeatableFieldList
      fieldType={base as BaseFieldType}
      name={safeName}
      label={props.label}
      values={arr}
      onChange={(next) => props.onChange(next)}
      options={props.options}
      min={props.min}
      max={props.max}
      step={props.step}
      placeholder={props.placeholder}
      rows={props.rows}
      itemTemplate={props.itemTemplate}
      workspaceId={props.workspaceId}
    />
  );
}
