'use client';

import React, {
  useId,
  useRef,
  useState,
  FC,
  useEffect,
  KeyboardEvent,
} from 'react';
import { SelectInputProps } from './SelectInput.types';
import {
  Container,
  StyledInput,
  StyledDropdown,
  StyledOption,
  StyledLabel,
  StyledDisplay,
} from './SelectInput.styles';
import { useOnClickOutside } from '../../../utils/useOnClickOutside';

const SelectInput: FC<SelectInputProps> = ({
  label,
  value,
  name,
  onChange,
  id,
  backgroundColor = '#fff',
  status = 'default',
  disabled = false,
  options,
  size = 'medium',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  const buttonRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  const toggleDropdown = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
      const currentIndex = options.findIndex(
        (opt) => String(opt.value) === String(value)
      );
      setFocusIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  const handleSelect = (newValue: string) => {
    if (newValue !== value) {
      const event = {
        target: {
          name,
          value: newValue,
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(event);
    }

    setTimeout(() => setOpen(false), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open && focusIndex !== null) {
          handleSelect(options[focusIndex].value as string);
        } else {
          setOpen(true);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setFocusIndex((prev) =>
          prev === null || prev === options.length - 1 ? 0 : prev + 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        setFocusIndex((prev) =>
          prev === null || prev === 0 ? options.length - 1 : prev - 1
        );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (open && focusIndex !== null) {
      optionsRef.current[focusIndex]?.focus();
    }
  }, [focusIndex, open]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(wrapperRef as React.RefObject<HTMLElement>, () =>
    setOpen(false)
  );

  return (
    <Container $backgroundColor={backgroundColor} ref={wrapperRef}>
      <StyledInput
        role="button"
        ref={buttonRef}
        id={selectId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        tabIndex={0}
        $status={status}
        $disabled={disabled}
        $size={size}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
      >
        <StyledDisplay>
          {/* ⬅️ hier: triggerLabel bevorzugen, sonst label */}
          {selectedOption?.triggerLabel ?? selectedOption?.label}
        </StyledDisplay>

        {label && (
          <StyledLabel
            id={labelId}
            htmlFor={selectId}
            $backgroundColor={backgroundColor}
            $isFloating={open || !!selectedOption}
            $size={size}
          >
            {label}
          </StyledLabel>
        )}

        {open && (
          <StyledDropdown
            role="listbox"
            id={listboxId}
            aria-labelledby={labelId}
            tabIndex={-1}
          >
            {options.map(
              ({ label: optionLabel, value: optionValue }, index) => (
                <StyledOption
                  key={optionValue as string}
                  ref={(el) => {
                    optionsRef.current[index] = el;
                  }}
                  role="option"
                  aria-selected={optionValue === selectedOption?.value}
                  tabIndex={-1}
                  onClick={() => handleSelect(optionValue as string)}
                  $selected={optionValue === selectedOption?.value}
                >
                  {optionLabel}
                </StyledOption>
              )
            )}
          </StyledDropdown>
        )}
      </StyledInput>
    </Container>
  );
};

export default SelectInput;
