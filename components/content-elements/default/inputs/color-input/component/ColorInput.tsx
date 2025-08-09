'use client';

import React, {
  FC,
  useId,
  ChangeEvent,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  ColorInputContainer,
  ColorInputWrapper,
  ColorPreview,
  ColorHexInput,
  ColorPickerWrapper,
  InvalidOverlay,
  StyledLabel,
} from './ColorInput.styles';
import { ColorInputProps } from './ColorInput.types';

const isValidHex = (hex: string) => /^#([0-9a-fA-F]{6})$/.test(hex);
const normalizeHex = (v: string) => {
  if (!v) return '';
  const s = v.startsWith('#') ? v : `#${v}`;
  return s.length === 7 ? s : s.slice(0, 7); // #RRGGBB begrenzen
};

const ColorInput: FC<ColorInputProps & { throttleMs?: number }> = ({
  label,
  value = '',
  onChange,
  id,
  name,
  disabled = false,
  backgroundColor = '#fff',
  throttleMs = 0, // Standard: kein Throttle
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Lokaler State für flüssige Eingabe
  const [local, setLocal] = useState<string>(normalizeHex(value) || '#ffffff');

  // Timeout-Ref für Throttle/Debounce
  const timerRef = useRef<number | null>(null);

  // Prop → State sync (nur wenn Wert von außen kommt)
  useEffect(() => {
    const next = normalizeHex(value) || '#ffffff';
    if (next !== local) {
      setLocal(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emitIfChanged = useCallback(
    (hex: string) => {
      if (hex !== value) {
        onChange(hex);
      }
    },
    [onChange, value]
  );

  // Emit-Funktion, optional gedrosselt
  const scheduleEmit = useCallback(
    (hex: string) => {
      if (throttleMs > 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          emitIfChanged(hex);
        }, throttleMs) as unknown as number;
      } else {
        emitIfChanged(hex);
      }
    },
    [emitIfChanged, throttleMs]
  );

  // Color-Picker (immer gültige Werte)
  const handleColorPickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const hex = normalizeHex(e.target.value).toLowerCase();
    setLocal(hex);
    scheduleEmit(hex);
  };

  // Textfeld (nur gültige Werte emitten)
  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const hex = normalizeHex(raw);
    setLocal(hex);
    if (isValidHex(hex)) {
      scheduleEmit(hex.toLowerCase());
    }
  };

  const previewValue = isValidHex(local) ? local : '#ffffff';
  const invalid = !isValidHex(local);

  return (
    <ColorInputContainer>
      {label && (
        <>
          <StyledLabel htmlFor={inputId} $backgroundColor={backgroundColor}>
            {label}
          </StyledLabel>
          <span id={`${inputId}-label`} className="sr-only">
            {label}
          </span>
        </>
      )}

      <ColorInputWrapper $backgroundColor={backgroundColor}>
        <ColorPickerWrapper>
          <ColorPreview
            type="color"
            id={inputId}
            name={name}
            disabled={disabled}
            value={previewValue}
            onChange={handleColorPickerChange}
            $invalid={invalid}
            aria-hidden="true"
          />
          {invalid && <InvalidOverlay />}
        </ColorPickerWrapper>

        <ColorHexInput
          id={`${inputId}-hex`}
          aria-labelledby={`${inputId}-label`}
          type="text"
          value={local}
          onChange={handleHexInputChange}
          maxLength={7}
          pattern="^#([0-9A-Fa-f]{6})$"
          disabled={disabled}
        />
      </ColorInputWrapper>
    </ColorInputContainer>
  );
};

export default ColorInput;
