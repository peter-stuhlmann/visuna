'use client';

import React, { FC, useId, KeyboardEvent } from 'react';
import {
  Container,
  SwitchWrapper,
  HiddenCheckbox,
  Track,
  Thumb,
  LabelText,
} from './SwitchInput.styles';
import { SwitchInputProps } from './SwitchInput.types';

const SwitchInput: FC<SwitchInputProps> = ({
  label,
  checked = false,
  onChange,
  name,
  id,
  disabled = false,
}) => {
  const autoId = useId();
  const inputId = id || autoId;

  const toggle = () => !disabled && onChange?.(!checked);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <Container>
      {/* Visuell verstecktes, aber echtes Formular-Element */}
      <HiddenCheckbox
        id={inputId}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={() => toggle()}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />

      <SwitchWrapper
        as="label"
        htmlFor={inputId}
        data-disabled={disabled ? 'true' : 'false'}
      >
        <Track
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          data-checked={checked ? 'true' : 'false'}
          onKeyDown={onKeyDown}
          onClick={(e) => {
            // label click würde das HiddenCheckbox bereits togglen;
            // Track-Click direkt unterstützt auch Klicks außerhalb des Labels.
            e.preventDefault();
            toggle();
          }}
        >
          <Thumb data-checked={checked ? 'true' : 'false'} />
        </Track>

        {label ? <LabelText>{label}</LabelText> : null}
      </SwitchWrapper>
    </Container>
  );
};

export default SwitchInput;
