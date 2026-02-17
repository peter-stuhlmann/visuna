'use client';

import React, { FC, useId } from 'react';
import {
  GroupContainer,
  RadioOption,
  HiddenRadio,
  Bullet,
  LabelText,
  GroupLabel,
  OptionLine,
} from './RadioInput.styles';
import { RadioInputProps } from './RadioInput.types';

const RadioInput: FC<RadioInputProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  orientation = 'vertical',
}) => {
  const autoId = useId();
  const groupName = name || autoId;

  return (
    <GroupContainer
      role="radiogroup"
      aria-label={label}
      data-disabled={disabled ? 'true' : 'false'}
      data-orientation={orientation}
    >
      {label ? <GroupLabel>{label}</GroupLabel> : null}

      {options.map((opt) => {
        const id = `${groupName}-${opt.value}`;
        const checked = value === opt.value;

        return (
          <OptionLine key={opt.value} data-orientation={orientation}>
            <RadioOption
              htmlFor={id}
              data-disabled={disabled ? 'true' : 'false'}
            >
              <HiddenRadio
                id={id}
                type="radio"
                name={groupName}
                value={opt.value}
                checked={checked}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
              />
              <Bullet
                aria-hidden="true"
                data-checked={checked ? 'true' : 'false'}
                data-disabled={disabled ? 'true' : 'false'}
              />
              <LabelText>{opt.label}</LabelText>
            </RadioOption>
          </OptionLine>
        );
      })}
    </GroupContainer>
  );
};

export default RadioInput;
