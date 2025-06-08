'use client';

import { useId, FC, ChangeEvent, useRef } from 'react';
import { SelectionControlsInputProps } from './SelectionControlsInput.types';
import {
  StyledCustomControl,
  StyledInputWrapper,
  StyledLabel,
  Wrapper,
} from './SelectionControlsInput.styles';
import { FaCheck } from 'react-icons/fa';
import Ripple from '../../../ripple/ripple';
import { RippleHandle } from '../../../ripple/ripple/component/Ripple.types';
import { getPrimaryColor } from '../../../constants';

const SelectionControlsInput: FC<SelectionControlsInputProps> = (props) => {
  const {
    label,
    checked = false,
    onChange,
    type = 'checkbox',
    id,
    name,
    ariaLabel,
  } = props;

  // 👉 diese Aufrufe außerhalb der Parameterliste behebt den Lint-Fehler
  const primaryColors = getPrimaryColor();
  const checkedColor = props.checkedColor ?? primaryColors['500'];
  const color = props.color ?? primaryColors['50'];

  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const rippleRef = useRef<RippleHandle>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    rippleRef.current?.createRipple(event);
  };

  return (
    <Wrapper onMouseDown={handleMouseDown}>
      <StyledInputWrapper>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type}
          checked={checked}
          onChange={handleChange}
          aria-label={label || ariaLabel}
        />
        <StyledCustomControl
          $checked={checked}
          $checkedColor={checkedColor}
          $color={color}
          $type={type}
          aria-hidden="true"
        >
          {type === 'checkbox' && checked && <FaCheck className="icon" />}
        </StyledCustomControl>
        <Ripple ref={rippleRef} color="rgba(0, 0, 255, 0.2)" />
      </StyledInputWrapper>
      {label && <StyledLabel htmlFor={inputId}>{label}</StyledLabel>}
    </Wrapper>
  );
};

export default SelectionControlsInput;
